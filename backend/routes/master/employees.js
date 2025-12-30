const express = require('express');
const router = express.Router();
const { checkModulePermission, checkBranchAccess } = require('../../middleware/masterAuth');
const MasterEmployee = require('../../models/MasterEmployee');
const Branch = require('../../models/Branch');

// Apply permission middleware to all routes
router.use(checkModulePermission('employees', 'view'));

// Get all employees with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, department, employeeType, status, branch } = req.query;
    const user = req.user;
    
    // Build filter
    let filter = {};
    
    // Branch Admin can only see their own branch employees
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    } else if (branch) {
      filter.branchId = branch;
    }
    
    if (department) filter.department = department;
    if (employeeType) filter.employeeType = employeeType;
    if (status) filter.status = status;
    
    // Search functionality
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    
    const employees = await MasterEmployee.find(filter)
      .populate('branchId', 'name city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await MasterEmployee.countDocuments(filter);
    
    res.json({
      employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single employee
router.get('/:id', async (req, res) => {
  try {
    const employee = await MasterEmployee.findById(req.params.id)
      .populate('branchId', 'name city state address');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && employee.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot access employee from other branch' });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new employee
router.post('/', checkModulePermission('employees', 'create'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      employeeId,
      department,
      designation,
      employeeType,
      joiningDate,
      qualifications,
      experience,
      address,
      salary,
      bankDetails,
      branchId
    } = req.body;
    
    // Check if employee already exists
    const existingEmployee = await MasterEmployee.findOne({
      $or: [{ email }, { employeeId }]
    });
    
    if (existingEmployee) {
      return res.status(400).json({ 
        message: 'Employee with this email or employee ID already exists' 
      });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && branchId !== req.user.branchId.toString()) {
      return res.status(403).json({ 
        message: 'Forbidden: Branch Admin can only create employees for their own branch' 
      });
    }
    
    // Generate employee ID if not provided
    let finalEmployeeId = employeeId;
    if (!finalEmployeeId) {
      const year = new Date().getFullYear();
      const deptCode = department.substring(0, 3).toUpperCase();
      const count = await MasterEmployee.countDocuments({ department, branchId });
      finalEmployeeId = `EMP${year}${deptCode}${String(count + 1).padStart(3, '0')}`;
    }
    
    const employee = new MasterEmployee({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      employeeId: finalEmployeeId,
      department,
      designation,
      employeeType,
      joiningDate,
      qualifications: qualifications || [],
      experience: experience || [],
      address,
      salary,
      bankDetails,
      createdBy: req.user._id,
      branchId
    });
    
    await employee.save();
    
    const populatedEmployee = await MasterEmployee.findById(employee._id)
      .populate('branchId', 'name city');
    
    res.status(201).json(populatedEmployee);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update employee
router.put('/:id', checkModulePermission('employees', 'edit'), async (req, res) => {
  try {
    const employee = await MasterEmployee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && employee.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot edit employee from other branch' });
    }
    
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      department,
      designation,
      employeeType,
      joiningDate,
      qualifications,
      experience,
      address,
      salary,
      bankDetails,
      status
    } = req.body;
    
    // Check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== employee.email) {
      const existingEmployee = await MasterEmployee.findOne({ email: req.body.email });
      if (existingEmployee) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }
    
    // Update employee
    Object.assign(employee, {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      department,
      designation,
      employeeType,
      joiningDate,
      qualifications,
      experience,
      address,
      salary,
      bankDetails,
      status
    });
    
    if (req.body.email) employee.email = req.body.email;
    
    await employee.save();
    
    const populatedEmployee = await MasterEmployee.findById(employee._id)
      .populate('branchId', 'name city');
    
    res.json(populatedEmployee);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete employee
router.delete('/:id', checkModulePermission('employees', 'delete'), async (req, res) => {
  try {
    const employee = await MasterEmployee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && employee.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot delete employee from other branch' });
    }
    
    await MasterEmployee.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get employees by department
router.get('/department/:department', async (req, res) => {
  try {
    const { department } = req.params;
    const user = req.user;
    
    let filter = { department };
    
    // Branch Admin can only see their own branch employees
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    }
    
    const employees = await MasterEmployee.find(filter)
      .populate('branchId', 'name city')
      .sort({ firstName: 1, lastName: 1 });
    
    res.json(employees);
  } catch (error) {
    console.error('Get employees by department error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get employees by branch
router.get('/branch/:branchId', checkBranchAccess, async (req, res) => {
  try {
    const { branchId } = req.params;
    
    const employees = await MasterEmployee.find({ branchId })
      .sort({ firstName: 1, lastName: 1 });
    
    res.json(employees);
  } catch (error) {
    console.error('Get employees by branch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get faculty members (for subject assignment)
router.get('/faculty/list', async (req, res) => {
  try {
    const user = req.user;
    
    let filter = { employeeType: 'Faculty', status: 'Active' };
    
    // Branch Admin can only see their own branch faculty
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    }
    
    const faculty = await MasterEmployee.find(filter)
      .select('firstName lastName email employeeId department')
      .sort({ firstName: 1, lastName: 1 });
    
    res.json(faculty);
  } catch (error) {
    console.error('Get faculty list error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
