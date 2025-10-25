import { publicProcedure, router } from "../index";
import { dashboardRouter } from "./dashboard";
import { clansRouter } from "./clans";
import { playersRouter } from "./players";
import { clanComparisonRouter } from "./clan-comparison";
import { playerComparisonRouter } from "./player-comparison";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	dashboard: dashboardRouter,
	clans: clansRouter,
	players: playersRouter,
	clanComparison: clanComparisonRouter,
	playerComparison: playerComparisonRouter,
});
export type AppRouter = typeof appRouter;
