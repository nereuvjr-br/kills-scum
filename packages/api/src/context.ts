export async function createContext(_req?: Request | unknown) {
	// No auth configured
	return {
		session: null,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
