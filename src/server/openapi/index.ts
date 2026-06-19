// Import all route metadata files to register them with the spec generator
import "@/pages/api/auth/routes";
import "@/pages/api/transactions/routes";
import "@/pages/api/categories/index";
import "@/pages/api/chat/routes";
import "@/pages/api/receipts/routes";
import "@/pages/api/stats/routes";
import "@/pages/api/settings/routes";

// Import actual route handlers
import "@/pages/api/auth/index";
import "@/pages/api/settings/index";
import "@/pages/api/chat/index";
