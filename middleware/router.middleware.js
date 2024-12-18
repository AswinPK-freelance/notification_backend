
import salesRoutes from '../routes/user.routes.js'; // Ensure ".js" extension is included.
import notificationRoutes from "../routes/notification.routes.js";
import { authenticateToken } from './auth.middleware.js';

function setupRouteHandler(app) {
    app.use(`/api/auth`, salesRoutes);
    app.use(`/api/notifications`, authenticateToken, notificationRoutes);
}

export default setupRouteHandler;  
