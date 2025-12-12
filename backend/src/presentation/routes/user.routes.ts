import { Router } from "express";
import * as UserController from "../controllers/UserController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/", UserController.getAllUsers);
router.get("/profile", UserController.getProfile);
router.put("/profile", UserController.updateProfile);
router.get("/:id", UserController.getUserById);
router.post("/", UserController.createUser);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

export default router;
