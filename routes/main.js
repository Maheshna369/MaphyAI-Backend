import express from "express";
import { leadGeneration } from "../controllers/leads/fun.js";
import { getUser } from "../controllers/user.js";
import { userSignIn } from "../controllers/SignIn.User.js";
//admin controllers
import { adminLogin } from "../controllers/admin/login.js";
import { getAdmin } from "../controllers/admin/fetch.admin.js";
import { adminLogout } from "../controllers/admin/logout.admin.js";
import { userLogout } from "../controllers/logout.user.js";
import { getAllClients } from "../controllers/admin/controllers/clients/fetch.clients.js";
import fetchClient from "../controllers/admin/controllers/clients/fetch.client.js";
import updateClient from "../controllers/admin/controllers/clients/update.client.js";
import {
  updateLeadClient,
  deleteLeadClient,
} from "../controllers/admin/controllers/clients/update.lead.client.js";
import {
  userRequest,
  fetchUserRequest,
} from "../controllers/requests/user.request.js";
import { fetchRequests } from "../controllers/requests/admin/requests.admin.requests.js";
import { updateRequest } from "../controllers/requests/admin/update.request.admin.requests.js";
import { fetchProjects } from "../controllers/projects/fetch.projects.js";
import { fetchDashboard } from "../controllers/admin/home/fetch.dashboard.home.admin.js";
//ai controllers
import { testAI } from "../controllers/maphyai/generate.text.maphyai.js";
const router = express.Router();
router.get("/get-user", getUser);
router.post("/sign-in", userSignIn);
router.get("/logout", userLogout);
router.post("/contact", leadGeneration);
router.get("/requests", fetchUserRequest);
router.post("/request/create", userRequest);
//admin routes
router.get("/admin", getAdmin);
router.get("/admin/logout", adminLogout);
router.post("/admin/login", adminLogin);
router.get("/admin/clients", getAllClients);
router.get("/admin/client", fetchClient);
router.patch("/admin/client/update", updateClient);
router.patch("/admin/client/lead/update", updateLeadClient);
router.patch("/admin/client/lead/delete", deleteLeadClient);
router.get("/admin/requests", fetchRequests);
router.patch("/admin/request/update", updateRequest);
router.get("/admin/projects", fetchProjects);
router.get("/admin/dashboard", fetchDashboard);
//ai routes
router.post("/maphyai/generate-text", testAI);
export default router;
