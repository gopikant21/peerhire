// Role-based access control middleware

// Check if user is an employer
exports.verifyEmployer = (req, res, next) => {
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        message: 'This route is restricted to employer accounts'
      });
    }
    next();
  };
  
  // Check if user is a freelancer
  exports.verifyFreelancer = (req, res, next) => {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'This route is restricted to freelancer accounts'
      });
    }
    next();
  };