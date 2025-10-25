"use client";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TITLE_TEXT = `
 ██████╗ ███████╗████████╗████████╗███████╗██████╗
 ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝
 ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗
 ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║
 ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

 ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
    ██║       ███████╗   ██║   ███████║██║     █████╔╝
    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 `;

export default function Home() {
	const healthCheck = trpc.healthCheck.useQuery();

	return (
		<div className="container mx-auto max-w-5xl px-4 py-8">
			<div className="mb-8 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 p-4">
				<pre className="overflow-x-auto font-mono text-xs text-green-400">{TITLE_TEXT}</pre>
			</div>
			
			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<div
								className={`h-3 w-3 rounded-full ${healthCheck.data ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
							/>
							Status da API
						</CardTitle>
						<CardDescription>
							{healthCheck.isLoading
								? "Verificando conexão..."
								: healthCheck.data
									? "Sistema online e conectado ao PostgreSQL"
									: "Sistema offline"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2 text-sm">
							<span className="font-medium">Database:</span>
							<span className="text-muted-foreground">PostgreSQL</span>
						</div>
					</CardContent>
				</Card>

				<Card className="border-blue-500/50 bg-blue-500/5">
					<CardHeader>
						<CardTitle>📊 Dashboard</CardTitle>
						<CardDescription>
							Visualize estatísticas completas de killfeeds
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link href="/dashboard">
							<Button variant="default" className="w-full" size="lg">
								Abrir Dashboard
							</Button>
						</Link>
					</CardContent>
				</Card>

				<Card className="border-green-500/50 bg-green-500/5">
					<CardHeader>
						<CardTitle>📥 Importar Dados</CardTitle>
						<CardDescription>
							Faça upload de arquivos CSV com killfeeds
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link href="/import">
							<Button variant="default" className="w-full" size="lg">
								Importar CSV
							</Button>
						</Link>
					</CardContent>
				</Card>

				<Card className="border-purple-500/50 bg-purple-500/5">
					<CardHeader>
						<CardTitle>🎮 Funcionalidades</CardTitle>
						<CardDescription>
							Sistema completo de análise
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2 text-sm">
							<li className="flex items-center gap-2">
								<span className="text-green-500">✓</span>
								<span>Importação de CSV sem limites</span>
							</li>
							<li className="flex items-center gap-2">
								<span className="text-green-500">✓</span>
								<span>Gráficos e estatísticas em tempo real</span>
							</li>
							<li className="flex items-center gap-2">
								<span className="text-green-500">✓</span>
								<span>Top Killers, Vítimas e Armas</span>
							</li>
							<li className="flex items-center gap-2">
								<span className="text-green-500">✓</span>
								<span>Análise de KD Ratio</span>
							</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
