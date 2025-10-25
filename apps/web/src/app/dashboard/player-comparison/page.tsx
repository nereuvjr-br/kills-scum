"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "@/components/loader";
import { ArrowLeft, Trophy, Swords, Target, Zap, Clock, Calendar, TrendingUp, Crosshair, Info, Activity, User } from "lucide-react";
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	Radar,
} from "recharts";

export default function PlayerComparisonPage() {
	const [player1Id, setPlayer1Id] = useState<number | undefined>(undefined);
	const [player2Id, setPlayer2Id] = useState<number | undefined>(undefined);
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");

	const { data: playersData, isLoading: playersLoading } = trpc.players.list.useQuery({});

	const { data: comparison, isLoading: comparisonLoading } = trpc.playerComparison.compare.useQuery(
		{
			player1Id: player1Id!,
			player2Id: player2Id!,
			startDate: startDate || undefined,
			endDate: endDate || undefined,
		},
		{
			enabled: !!player1Id && !!player2Id && player1Id !== player2Id,
		}
	);

	if (playersLoading) {
		return <Loader />;
	}

	const availablePlayers = playersData || [];
	const selectedPlayer1 = availablePlayers.find((p) => p.id === player1Id);
	const selectedPlayer2 = availablePlayers.find((p) => p.id === player2Id);

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Comparação de Players</h1>
					<p className="text-muted-foreground">
						Analise o desempenho de dois players lado a lado
					</p>
				</div>
				<Button variant="outline" asChild>
					<Link href="/dashboard">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Voltar
					</Link>
				</Button>
			</div>

			{/* Seletores */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="player1">Player 1</Label>
					<Select
						value={player1Id?.toString()}
						onValueChange={(value) => setPlayer1Id(Number(value))}
					>
						<SelectTrigger id="player1">
							<SelectValue placeholder="Selecione o primeiro player" />
						</SelectTrigger>
						<SelectContent>
							{availablePlayers
								.filter((p) => p.id !== player2Id)
								.map((player) => (
									<SelectItem key={player.id} value={player.id.toString()}>
										<div className="flex items-center gap-2">
											<span className="font-mono">{player.name}</span>
											{player.clan && (
												<span
													className="text-xs px-2 py-0.5 rounded"
													style={{
														backgroundColor: (player.clan.color || "#888") + "20",
														color: player.clan.color || "#888",
													}}
												>
													[{player.clan.tag}]
												</span>
											)}
										</div>
									</SelectItem>
								))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label htmlFor="player2">Player 2</Label>
					<Select
						value={player2Id?.toString()}
						onValueChange={(value) => setPlayer2Id(Number(value))}
					>
						<SelectTrigger id="player2">
							<SelectValue placeholder="Selecione o segundo player" />
						</SelectTrigger>
						<SelectContent>
							{availablePlayers
								.filter((p) => p.id !== player1Id)
								.map((player) => (
									<SelectItem key={player.id} value={player.id.toString()}>
										<div className="flex items-center gap-2">
											<span className="font-mono">{player.name}</span>
											{player.clan && (
												<span
													className="text-xs px-2 py-0.5 rounded"
													style={{
														backgroundColor: (player.clan.color || "#888") + "20",
														color: player.clan.color || "#888",
													}}
												>
													[{player.clan.tag}]
												</span>
											)}
										</div>
									</SelectItem>
								))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Filtros de Data */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="startDate">Data Inicial</Label>
					<Input
						id="startDate"
						type="datetime-local"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="endDate">Data Final</Label>
					<Input
						id="endDate"
						type="datetime-local"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
					/>
				</div>
			</div>

			{comparisonLoading && (
				<div className="flex justify-center p-12">
					<Loader />
				</div>
			)}

			{comparison && selectedPlayer1 && selectedPlayer2 && (
				<>
					{/* Resumo Executivo */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Info className="h-5 w-5" />
								Resumo da Rivalidade
							</CardTitle>
							<CardDescription>
								Principais insights do confronto direto entre os players
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{/* Confrontos Diretos */}
								<div className="text-center p-4 rounded-lg bg-muted/50">
									<div className="text-sm text-muted-foreground mb-2">
										Confrontos Diretos
									</div>
									<div className="text-3xl font-bold flex items-center justify-center gap-2">
										<span style={{ color: selectedPlayer1.clan?.color || "#888" }}>
											{comparison.headToHead.player1Wins}
										</span>
										<span className="text-muted-foreground">×</span>
										<span style={{ color: selectedPlayer2.clan?.color || "#888" }}>
											{comparison.headToHead.player2Wins}
										</span>
									</div>
									<div className="text-sm text-muted-foreground mt-2">
										{comparison.headToHead.player1Wins > comparison.headToHead.player2Wins
											? `${selectedPlayer1.name} domina com ${Math.round((comparison.headToHead.player1Wins / (comparison.headToHead.player1Wins + comparison.headToHead.player2Wins)) * 100)}% de vitórias`
											: comparison.headToHead.player2Wins > comparison.headToHead.player1Wins
											? `${selectedPlayer2.name} domina com ${Math.round((comparison.headToHead.player2Wins / (comparison.headToHead.player1Wins + comparison.headToHead.player2Wins)) * 100)}% de vitórias`
											: "Empate técnico!"}
									</div>
								</div>

								{/* Performance Geral (K/D) */}
								<div className="text-center p-4 rounded-lg bg-muted/50">
									<div className="text-sm text-muted-foreground mb-2">
										Performance Geral (K/D)
									</div>
									<div className="text-3xl font-bold flex items-center justify-center gap-2">
										<span style={{ color: selectedPlayer1.clan?.color || "#888" }}>
											{comparison.player1.kd.toFixed(2)}
										</span>
										<span className="text-muted-foreground">×</span>
										<span style={{ color: selectedPlayer2.clan?.color || "#888" }}>
											{comparison.player2.kd.toFixed(2)}
										</span>
									</div>
									<div className="text-sm text-muted-foreground mt-2">
										{comparison.player1.kd > comparison.player2.kd
											? `${selectedPlayer1.name} é ${Math.round(((comparison.player1.kd - comparison.player2.kd) / comparison.player2.kd) * 100)}% mais eficiente`
											: comparison.player2.kd > comparison.player1.kd
											? `${selectedPlayer2.name} é ${Math.round(((comparison.player2.kd - comparison.player1.kd) / comparison.player1.kd) * 100)}% mais eficiente`
											: "Mesma eficiência!"}
									</div>
								</div>

								{/* Estilo de Combate (Distância) */}
								<div className="text-center p-4 rounded-lg bg-muted/50">
									<div className="text-sm text-muted-foreground mb-2">
										Estilo de Combate (Distância Média)
									</div>
									<div className="text-3xl font-bold flex items-center justify-center gap-2">
										<span style={{ color: selectedPlayer1.clan?.color || "#888" }}>
											{comparison.player1.avgDistance}m
										</span>
										<span className="text-muted-foreground">×</span>
										<span style={{ color: selectedPlayer2.clan?.color || "#888" }}>
											{comparison.player2.avgDistance}m
										</span>
									</div>
									<div className="text-sm text-muted-foreground mt-2">
										{comparison.player1.avgDistance > comparison.player2.avgDistance
											? `${selectedPlayer1.name} prefere combate à distância`
											: comparison.player2.avgDistance > comparison.player1.avgDistance
											? `${selectedPlayer2.name} prefere combate à distância`
											: "Mesmo estilo de combate!"}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Gráfico de Confrontos Diretos */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Swords className="h-5 w-5" />
								Confrontos Diretos
							</CardTitle>
							<CardDescription>
								Vitórias de cada player nos combates diretos
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={200}>
								<BarChart
									data={[
										{
											name: "Vitórias",
											[selectedPlayer1.name]: comparison.headToHead.player1Wins,
											[selectedPlayer2.name]: comparison.headToHead.player2Wins,
										},
									]}
									layout="vertical"
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis type="number" />
									<YAxis type="category" dataKey="name" />
									<Tooltip />
									<Legend />
									<Bar
										dataKey={selectedPlayer1.name}
										fill={selectedPlayer1.clan?.color || "#888"}
									/>
									<Bar
										dataKey={selectedPlayer2.name}
										fill={selectedPlayer2.clan?.color || "#888"}
									/>
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{/* Evolução Temporal - Head to Head */}
					{comparison.headToHead.headToHeadDaily.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<TrendingUp className="h-5 w-5" />
									Evolução do Confronto ao Longo do Tempo
								</CardTitle>
								<CardDescription>
									Como a rivalidade evoluiu dia a dia
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ResponsiveContainer width="100%" height={300}>
									<LineChart data={comparison.headToHead.headToHeadDaily}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis
											dataKey="date"
											tickFormatter={(date) => {
												const d = new Date(date);
												return `${d.getDate()}/${d.getMonth() + 1}`;
											}}
										/>
										<YAxis />
										<Tooltip
											labelFormatter={(date) => {
												const d = new Date(date as string);
												return d.toLocaleDateString("pt-BR");
											}}
										/>
										<Legend />
										<Line
											type="monotone"
											dataKey="player1Kills"
											name={selectedPlayer1.name}
											stroke={selectedPlayer1.clan?.color || "#888"}
											strokeWidth={2}
											dot={{ r: 4 }}
										/>
										<Line
											type="monotone"
											dataKey="player2Kills"
											name={selectedPlayer2.name}
											stroke={selectedPlayer2.clan?.color || "#888"}
											strokeWidth={2}
											dot={{ r: 4 }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					)}

					{/* Radar Chart - Comparação Multidimensional */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Target className="h-5 w-5" />
								Comparação Multidimensional
							</CardTitle>
							<CardDescription>
								Visualização de múltiplas métricas em um único gráfico
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={400}>
								<RadarChart
									data={[
										{
											stat: "K/D Ratio",
											[selectedPlayer1.name]: comparison.player1.kd,
											[selectedPlayer2.name]: comparison.player2.kd,
										},
										{
											stat: "Total Kills",
											[selectedPlayer1.name]: comparison.player1.totalKills / 10,
											[selectedPlayer2.name]: comparison.player2.totalKills / 10,
										},
										{
											stat: "Avg Distance",
											[selectedPlayer1.name]: comparison.player1.avgDistance / 10,
											[selectedPlayer2.name]: comparison.player2.avgDistance / 10,
										},
										{
											stat: "Vitórias H2H",
											[selectedPlayer1.name]: comparison.headToHead.player1Wins,
											[selectedPlayer2.name]: comparison.headToHead.player2Wins,
										},
										{
											stat: "Max Streak",
											[selectedPlayer1.name]: comparison.player1.maxStreak,
											[selectedPlayer2.name]: comparison.player2.maxStreak,
										},
									]}
								>
									<PolarGrid />
									<PolarAngleAxis dataKey="stat" />
									<PolarRadiusAxis />
									<Radar
										name={selectedPlayer1.name}
										dataKey={selectedPlayer1.name}
										stroke={selectedPlayer1.clan?.color || "#888"}
										fill={selectedPlayer1.clan?.color || "#888"}
										fillOpacity={0.3}
									/>
									<Radar
										name={selectedPlayer2.name}
										dataKey={selectedPlayer2.name}
										stroke={selectedPlayer2.clan?.color || "#888"}
										fill={selectedPlayer2.clan?.color || "#888"}
										fillOpacity={0.3}
									/>
									<Legend />
								</RadarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{/* Atividade por Hora */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="h-5 w-5" />
								Atividade por Hora do Dia
							</CardTitle>
							<CardDescription>
								Quando cada player é mais ativo no jogo
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart
									data={Array.from({ length: 24 }, (_, i) => ({
										hour: `${i}h`,
										[selectedPlayer1.name]: comparison.player1.hourlyActivity[i],
										[selectedPlayer2.name]: comparison.player2.hourlyActivity[i],
									}))}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="hour" />
									<YAxis />
									<Tooltip />
									<Legend />
									<Bar
										dataKey={selectedPlayer1.name}
										fill={selectedPlayer1.clan?.color || "#888"}
									/>
									<Bar
										dataKey={selectedPlayer2.name}
										fill={selectedPlayer2.clan?.color || "#888"}
									/>
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{/* Estatísticas nos Confrontos Diretos */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Swords className="h-5 w-5" />
								Estatísticas nos Confrontos Diretos
							</CardTitle>
							<CardDescription>
								Armas, táticas e métricas específicas dos combates diretos entre os dois players
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Player 1 Head to Head Stats */}
								<div className="space-y-4">
									<div className="flex items-center gap-2 mb-4">
										<div
											className="w-3 h-3 rounded-full"
											style={{ backgroundColor: selectedPlayer1.clan?.color || "#888" }}
										/>
										<span className="font-semibold">
											{selectedPlayer1.name} vs {selectedPlayer2.name}
										</span>
									</div>

									{/* Avg Distance in H2H */}
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											Distância Média
										</span>
										<span className="text-lg font-bold">
											{comparison.headToHead.player1Stats.avgDistance}m
										</span>
									</div>

									{/* Top Weapons in H2H */}
									<div>
										<div className="text-sm font-semibold mb-2">
											Armas Usadas
										</div>
										<div className="space-y-1">
											{comparison.headToHead.player1Stats.topWeapons.map(
												(
													weapon: { weapon: string | null; count: number },
													idx: number,
												) => (
													<div
														key={idx}
														className="flex items-center justify-between text-sm"
													>
														<span className="text-muted-foreground">
															{weapon.weapon || "Desconhecida"}
														</span>
														<span className="font-mono">
															{weapon.count}
														</span>
													</div>
												),
											)}
										</div>
									</div>
								</div>

								{/* Player 2 Head to Head Stats */}
								<div className="space-y-4">
									<div className="flex items-center gap-2 mb-4">
										<div
											className="w-3 h-3 rounded-full"
											style={{ backgroundColor: selectedPlayer2.clan?.color || "#888" }}
										/>
										<span className="font-semibold">
											{selectedPlayer2.name} vs {selectedPlayer1.name}
										</span>
									</div>

									{/* Avg Distance in H2H */}
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											Distância Média
										</span>
										<span className="text-lg font-bold">
											{comparison.headToHead.player2Stats.avgDistance}m
										</span>
									</div>

									{/* Top Weapons in H2H */}
									<div>
										<div className="text-sm font-semibold mb-2">
											Armas Usadas
										</div>
										<div className="space-y-1">
											{comparison.headToHead.player2Stats.topWeapons.map(
												(
													weapon: { weapon: string | null; count: number },
													idx: number,
												) => (
													<div
														key={idx}
														className="flex items-center justify-between text-sm"
													>
														<span className="text-muted-foreground">
															{weapon.weapon || "Desconhecida"}
														</span>
														<span className="font-mono">
															{weapon.count}
														</span>
													</div>
												),
											)}
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Overall Stats */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Player 1 Stats */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="h-4 w-4" />
									<span className="font-mono">{selectedPlayer1.name}</span>
									{selectedPlayer1.clan && (
										<span
											className="text-sm px-2 py-0.5 rounded"
											style={{
												backgroundColor: (selectedPlayer1.clan.color || "#888") + "20",
												color: selectedPlayer1.clan.color || "#888",
											}}
										>
											[{selectedPlayer1.clan.tag}]
										</span>
									)}
								</CardTitle>
								<CardDescription>
									Estatísticas gerais de todos os combates
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Trophy className="h-4 w-4 text-muted-foreground" />
										<span>Total de Kills</span>
									</div>
									<span className="text-2xl font-bold">
										{comparison.player1.totalKills}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Target className="h-4 w-4 text-muted-foreground" />
										<span>Total de Mortes</span>
									</div>
									<span className="text-2xl font-bold">
										{comparison.player1.totalDeaths}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Zap className="h-4 w-4 text-muted-foreground" />
										<span>K/D Ratio</span>
									</div>
									<span className="text-2xl font-bold">
										{comparison.player1.kd.toFixed(2)}
									</span>
								</div>
								<div className="pt-4 border-t">
									<div className="text-sm font-semibold mb-2">
										Armas Favoritas
									</div>
									<div className="space-y-2">
										{comparison.player1.topWeapons.map((weapon: { weapon: string | null; count: number }, idx: number) => (
											<div
												key={idx}
												className="flex items-center justify-between text-sm"
											>
												<span className="text-muted-foreground">
													{weapon.weapon || "Desconhecida"}
												</span>
												<span className="font-mono">{weapon.count}</span>
											</div>
										))}
									</div>
								</div>
								<div className="pt-4 border-t">
									<div className="text-sm font-semibold mb-2">
										Vítimas Favoritas
									</div>
									<div className="space-y-2">
										{comparison.player1.topVictims.map((victim: { victim: string | null; count: number }, idx: number) => (
											<div
												key={idx}
												className="flex items-center justify-between text-sm"
											>
												<span className="text-muted-foreground font-mono">
													{victim.victim || "Desconhecido"}
												</span>
												<span className="font-mono">{victim.count}</span>
											</div>
										))}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Player 2 Stats */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="h-4 w-4" />
									<span className="font-mono">{selectedPlayer2.name}</span>
									{selectedPlayer2.clan && (
										<span
											className="text-sm px-2 py-0.5 rounded"
											style={{
												backgroundColor: (selectedPlayer2.clan.color || "#888") + "20",
												color: selectedPlayer2.clan.color || "#888",
											}}
										>
											[{selectedPlayer2.clan.tag}]
										</span>
									)}
								</CardTitle>
								<CardDescription>
									Estatísticas gerais de todos os combates
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Trophy className="h-4 w-4 text-muted-foreground" />
										<span>Total de Kills</span>
									</div>
									<span className="text-2xl font-bold">
										{comparison.player2.totalKills}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Target className="h-4 w-4 text-muted-foreground" />
										<span>Total de Mortes</span>
									</div>
									<span className="text-2xl font-bold">
										{comparison.player2.totalDeaths}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Zap className="h-4 w-4 text-muted-foreground" />
										<span>K/D Ratio</span>
									</div>
									<span className="text-2xl font-bold">
										{comparison.player2.kd.toFixed(2)}
									</span>
								</div>
								<div className="pt-4 border-t">
									<div className="text-sm font-semibold mb-2">
										Armas Favoritas
									</div>
									<div className="space-y-2">
										{comparison.player2.topWeapons.map((weapon: { weapon: string | null; count: number }, idx: number) => (
											<div
												key={idx}
												className="flex items-center justify-between text-sm"
											>
												<span className="text-muted-foreground">
													{weapon.weapon || "Desconhecida"}
												</span>
												<span className="font-mono">{weapon.count}</span>
											</div>
										))}
									</div>
								</div>
								<div className="pt-4 border-t">
									<div className="text-sm font-semibold mb-2">
										Vítimas Favoritas
									</div>
									<div className="space-y-2">
										{comparison.player2.topVictims.map((victim: { victim: string | null; count: number }, idx: number) => (
											<div
												key={idx}
												className="flex items-center justify-between text-sm"
											>
												<span className="text-muted-foreground font-mono">
													{victim.victim || "Desconhecido"}
												</span>
												<span className="font-mono">{victim.count}</span>
											</div>
										))}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Estatísticas Avançadas */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Activity className="h-5 w-5" />
								Estatísticas Avançadas
							</CardTitle>
							<CardDescription>
								Métricas especializadas de combate: distância, horários de pico, sequências e melhores performances
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{/* Distance Stats */}
								<Card>
									<CardHeader>
										<CardTitle className="text-base flex items-center gap-2">
											<Crosshair className="h-4 w-4" />
											Distância Média
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="text-center">
											<div
												className="text-3xl font-bold"
												style={{ color: selectedPlayer1.clan?.color || "#888" }}
											>
												{comparison.player1.avgDistance}m
											</div>
											<div className="text-xs text-muted-foreground">
												{selectedPlayer1.name}
											</div>
										</div>
										<div className="text-center border-t pt-4">
											<div
												className="text-3xl font-bold"
												style={{ color: selectedPlayer2.clan?.color || "#888" }}
											>
												{comparison.player2.avgDistance}m
											</div>
											<div className="text-xs text-muted-foreground">
												{selectedPlayer2.name}
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Active Hours */}
								<Card>
									<CardHeader>
										<CardTitle className="text-base flex items-center gap-2">
											<Clock className="h-4 w-4" />
											Horário Mais Ativo
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="text-center">
											<div
												className="text-3xl font-bold"
												style={{ color: selectedPlayer1.clan?.color || "#888" }}
											>
												{comparison.player1.mostActiveHour}h
											</div>
											<div className="text-xs text-muted-foreground">
												{selectedPlayer1.name}
											</div>
										</div>
										<div className="text-center border-t pt-4">
											<div
												className="text-3xl font-bold"
												style={{ color: selectedPlayer2.clan?.color || "#888" }}
											>
												{comparison.player2.mostActiveHour}h
											</div>
											<div className="text-xs text-muted-foreground">
												{selectedPlayer2.name}
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Max Streak */}
								<Card>
									<CardHeader>
										<CardTitle className="text-base flex items-center gap-2">
											<TrendingUp className="h-4 w-4" />
											Sequência Máxima
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="text-center">
											<div
												className="text-3xl font-bold"
												style={{ color: selectedPlayer1.clan?.color || "#888" }}
											>
												{comparison.player1.maxStreak}
											</div>
											<div className="text-xs text-muted-foreground">
												{selectedPlayer1.name}
											</div>
										</div>
										<div className="text-center border-t pt-4">
											<div
												className="text-3xl font-bold"
												style={{ color: selectedPlayer2.clan?.color || "#888" }}
											>
												{comparison.player2.maxStreak}
											</div>
											<div className="text-xs text-muted-foreground">
												{selectedPlayer2.name}
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						</CardContent>
					</Card>

					{/* Longest Kills */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-base">
									Kill Mais Longo - {selectedPlayer1.name}
								</CardTitle>
							</CardHeader>
							<CardContent>
								{comparison.player1.longestKill ? (
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground">Distância:</span>
											<span className="font-bold">
												{comparison.player1.longestKill.distance}m
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Killer:</span>
											<span className="font-mono">
												{comparison.player1.longestKill.killer}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Victim:</span>
											<span className="font-mono">
												{comparison.player1.longestKill.victim}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Arma:</span>
											<span>{comparison.player1.longestKill.weapon}</span>
										</div>
									</div>
								) : (
									<p className="text-sm text-muted-foreground">
										Nenhum kill registrado
									</p>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-base">
									Kill Mais Longo - {selectedPlayer2.name}
								</CardTitle>
							</CardHeader>
							<CardContent>
								{comparison.player2.longestKill ? (
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground">Distância:</span>
											<span className="font-bold">
												{comparison.player2.longestKill.distance}m
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Killer:</span>
											<span className="font-mono">
												{comparison.player2.longestKill.killer}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Victim:</span>
											<span className="font-mono">
												{comparison.player2.longestKill.victim}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Arma:</span>
											<span>{comparison.player2.longestKill.weapon}</span>
										</div>
									</div>
								) : (
									<p className="text-sm text-muted-foreground">
										Nenhum kill registrado
									</p>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Melhores Dias */}
					{(comparison.player1.bestDay.kills > 0 || comparison.player2.bestDay.kills > 0) && (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Card>
								<CardHeader>
									<CardTitle className="text-base flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										Melhor Dia - {selectedPlayer1.name}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground">Data:</span>
											<span className="font-mono">
												{new Date(comparison.player1.bestDay.date).toLocaleDateString("pt-BR")}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Kills:</span>
											<span className="font-bold text-lg">
												{comparison.player1.bestDay.kills}
											</span>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="text-base flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										Melhor Dia - {selectedPlayer2.name}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground">Data:</span>
											<span className="font-mono">
												{new Date(comparison.player2.bestDay.date).toLocaleDateString("pt-BR")}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Kills:</span>
											<span className="font-bold text-lg">
												{comparison.player2.bestDay.kills}
											</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Recent Battles */}
					{comparison.headToHead.recentBattles.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Swords className="h-5 w-5" />
									Últimos Confrontos Diretos
								</CardTitle>
								<CardDescription>
									Histórico cronológico dos últimos 10 combates diretos entre os players
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{comparison.headToHead.recentBattles.map(
										(
											battle: {
												killer: string;
												victim: string;
												weapon: string | null;
												distance: string | number | null;
												timestamp: string;
											},
											idx: number,
										) => {
											const isPlayer1Kill = battle.killer === selectedPlayer1.name;
											return (
												<div
													key={idx}
													className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
												>
													<div className="flex-1 space-y-1">
														<div className="flex items-center gap-2">
															<div
																className="w-2 h-2 rounded-full"
																style={{
																	backgroundColor: isPlayer1Kill
																		? selectedPlayer1.clan?.color || "#888"
																		: selectedPlayer2.clan?.color || "#888",
																}}
															/>
															<span className="font-mono text-sm font-semibold">
																{battle.killer}
															</span>
															<span className="text-xs text-muted-foreground">
																matou
															</span>
															<span className="font-mono text-sm">
																{battle.victim}
															</span>
														</div>
														<div className="flex items-center gap-3 text-xs text-muted-foreground ml-4">
															<span>{battle.weapon || "Arma desconhecida"}</span>
															<span>•</span>
															<span>{battle.distance}m</span>
															<span>•</span>
															<span>
																{new Date(battle.timestamp).toLocaleString("pt-BR")}
															</span>
														</div>
													</div>
												</div>
											);
										},
									)}
								</div>
							</CardContent>
						</Card>
					)}
				</>
			)}
		</div>
	);
}
