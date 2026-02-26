// Admin vs Sales agent role check middleware
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      console.log('DEBUG Authorize:', {
        userEmail: req.user.email,
        userRole: req.user.role,
        allowedRoles
      });

      const userRole = req.user.role?.toLowerCase();
      const isAuthorized = allowedRoles.some(role => role.toLowerCase() === userRole);

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  };
};