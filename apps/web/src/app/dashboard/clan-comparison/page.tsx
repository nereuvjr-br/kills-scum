"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/utils/trpc";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "@/components/loader";
import { ArrowLeft, Trophy, Swords, Target, Zap, Clock, Calendar, TrendingUp, Crosshair, Info, Activity } from "lucide-react";
import Link from "next/link";
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

export default function ClanComparisonPage() {
	const [clan1Id, setClan1Id] = useState<number | null>(null);
	const [clan2Id, setClan2Id] = useState<number | null>(null);
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");

	const { data: clans, isLoading: clansLoading } = trpc.clans.list.useQuery();

	const { data: comparison, isLoading: comparisonLoading } =
		trpc.clanComparison.compare.useQuery(
			{
				clan1Id: clan1Id!,
				clan2Id: clan2Id!,
				startDate: startDate || undefined,
				endDate: endDate || undefined,
			},
			{
				enabled: clan1Id !== null && clan2Id !== null && clan1Id !== clan2Id,
			},
		);

	const selectedClan1 = clans?.find((c) => c.id === clan1Id);
	const selectedClan2 = clans?.find((c) => c.id === clan2Id);

	if (clansLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader />
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link href="/dashboard">
					<Button variant="ghost" size="icon">
						<ArrowLeft className="h-5 w-5" />
					</Button>
				</Link>
				<div>
					<h1 className="text-3xl font-bold">Comparação de Clãs</h1>
					<p className="text-muted-foreground">
						Compare estatísticas entre dois clãs
					</p>
				</div>
			</div>

			{/* Clan Selectors */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardHeader>
						<CardTitle>Clã 1</CardTitle>
						<CardDescription>Selecione o primeiro clã</CardDescription>
					</CardHeader>
					<CardContent>
						<Select
							value={clan1Id?.toString()}
							onValueChange={(value: string) => setClan1Id(parseInt(value))}
						>
							<SelectTrigger>
								<SelectValue placeholder="Escolha um clã" />
							</SelectTrigger>
							<SelectContent>
								{clans?.map((clan) => (
									<SelectItem
										key={clan.id}
										value={clan.id.toString()}
										disabled={clan.id === clan2Id}
									>
										<div className="flex items-center gap-2">
											<div
												className="w-3 h-3 rounded-full"
												style={{ backgroundColor: clan.color || "#888" }}
											/>
											<span className="font-mono font-bold">[{clan.tag}]</span>
											<span>{clan.name}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Clã 2</CardTitle>
						<CardDescription>Selecione o segundo clã</CardDescription>
					</CardHeader>
					<CardContent>
						<Select
							value={clan2Id?.toString()}
							onValueChange={(value: string) => setClan2Id(parseInt(value))}
						>
							<SelectTrigger>
								<SelectValue placeholder="Escolha um clã" />
							</SelectTrigger>
							<SelectContent>
								{clans?.map((clan) => (
									<SelectItem
										key={clan.id}
										value={clan.id.toString()}
										disabled={clan.id === clan1Id}
									>
										<div className="flex items-center gap-2">
											<div
												className="w-3 h-3 rounded-full"
												style={{ backgroundColor: clan.color || "#888" }}
											/>
											<span className="font-mono font-bold">[{clan.tag}]</span>
											<span>{clan.name}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardContent>
				</Card>
			</div>

			{/* Date Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Filtrar por Período
					</CardTitle>
					<CardDescription>
						Deixe vazio para analisar todos os registros
					</CardDescription>
				</CardHeader>
				<CardContent>
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
					{(startDate || endDate) && (
						<div className="mt-4">
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setStartDate("");
									setEndDate("");
								}}
							>
								Limpar Filtros
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Comparison Results */}
			{comparisonLoading && (
				<div className="flex items-center justify-center py-12">
					<Loader />
				</div>
			)}

			{comparison && selectedClan1 && selectedClan2 && (
				<>
					{/* Executive Summary */}
					<Card className="border-2">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Info className="h-5 w-5" />
								Resumo da Rivalidade
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="text-center">
									<div className="text-sm text-muted-foreground mb-2">
										Confrontos Diretos
									</div>
									<div className="flex items-center justify-center gap-4">
										<div>
											<div
												className="text-3xl font-bold"
												style={{ color: selectedClan1.color || undefined }}
											>
												{comparison.headToHead.clan1Wins}
											</div>
											<div className="text-xs">{selectedClan1.tag}</div>
										</div>
										<div className="text-2xl font-bold text-muted-foreground">
											vs
										</div>
										<div>
											<div
												className="text-3xl font-bold"
												style={{ color: selectedClan2.color || undefined }}
											>
												{comparison.headToHead.clan2Wins}
											</div>
											<div className="text-xs">{selectedClan2.tag}</div>
										</div>
									</div>
									<div className="mt-2 text-xs text-muted-foreground">
										{comparison.headToHead.clan1Wins >
										comparison.headToHead.clan2Wins
											? `${selectedClan1.tag} domina com ${Math.round(
													(comparison.headToHead.clan1Wins /
														(comparison.headToHead.clan1Wins +
															comparison.headToHead.clan2Wins)) *
														100,
											  )}% de vitórias`
											: comparison.headToHead.clan2Wins >
											  comparison.headToHead.clan1Wins
											? `${selectedClan2.tag} domina com ${Math.round(
													(comparison.headToHead.clan2Wins /
														(comparison.headToHead.clan1Wins +
															comparison.headToHead.clan2Wins)) *
														100,
											  )}% de vitórias`
											: "Rivalidade equilibrada!"}
									</div>
								</div>

								<div className="text-center">
									<div className="text-sm text-muted-foreground mb-2">
										Performance Geral
									</div>
									<div className="flex items-center justify-center gap-4">
										<div>
											<div
												className="text-3xl font-bold"
												style={{ color: selectedClan1.color || undefined }}
											>
												{comparison.clan1.kd.toFixed(2)}
											</div>
											<div className="text-xs">{selectedClan1.tag}</div>
										</div>
										<div className="text-2xl font-bold text-muted-foreground">
											K/D
										</div>
										<div>
											<div
												className="text-3xl font-bold"
												style={{ color: selectedClan2.color || undefined }}
											>
												{comparison.clan2.kd.toFixed(2)}
											</div>
											<div className="text-xs">{selectedClan2.tag}</div>
										</div>
									</div>
									<div className="mt-2 text-xs text-muted-foreground">
										{comparison.clan1.kd > comparison.clan2.kd
											? `${selectedClan1.tag} é ${((comparison.clan1.kd / comparison.clan2.kd - 1) * 100).toFixed(0)}% mais eficiente`
											: `${selectedClan2.tag} é ${((comparison.clan2.kd / comparison.clan1.kd - 1) * 100).toFixed(0)}% mais eficiente`}
									</div>
								</div>

								<div className="text-center">
									<div className="text-sm text-muted-foreground mb-2">
										Estilo de Combate
									</div>
									<div className="flex items-center justify-center gap-4">
										<div>
											<div
												className="text-3xl font-bold"
												style={{ color: selectedClan1.color || undefined }}
											>
												{comparison.clan1.avgDistance}m
											</div>
											<div className="text-xs">{selectedClan1.tag}</div>
										</div>
										<div className="text-2xl font-bold text-muted-foreground">
											Dist
										</div>
										<div>
											<div
												className="text-3xl font-bold"
												style={{ color: selectedClan2.color || undefined }}
											>
												{comparison.clan2.avgDistance}m
											</div>
											<div className="text-xs">{selectedClan2.tag}</div>
										</div>
									</div>
									<div className="mt-2 text-xs text-muted-foreground">
										{comparison.clan1.avgDistance > comparison.clan2.avgDistance
											? `${selectedClan1.tag} prefere combate à distância`
											: comparison.clan2.avgDistance > comparison.clan1.avgDistance
											? `${selectedClan2.tag} prefere combate à distância`
											: "Ambos com estilo similar"}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Direct Confrontations */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Swords className="h-5 w-5" />
								Placar dos Confrontos Diretos
							</CardTitle>
							<CardDescription>
								Vitórias de {selectedClan1.tag} vs {selectedClan2.tag}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-[300px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={[
											{
												name: "Confrontos",
												[selectedClan1.tag]: comparison.headToHead.clan1Wins,
												[selectedClan2.tag]: comparison.headToHead.clan2Wins,
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
											dataKey={selectedClan1.tag}
											fill={selectedClan1.color || "#3b82f6"}
											radius={[0, 8, 8, 0]}
										/>
										<Bar
											dataKey={selectedClan2.tag}
											fill={selectedClan2.color || "#ef4444"}
											radius={[0, 8, 8, 0]}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>

					{/* Head to Head Timeline */}
					{comparison.headToHead.headToHeadDaily &&
						comparison.headToHead.headToHeadDaily.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<TrendingUp className="h-5 w-5" />
										Evolução dos Confrontos Diretos
									</CardTitle>
									<CardDescription>
										Histórico de kills em confrontos diretos ao longo do tempo
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="h-[300px]">
										<ResponsiveContainer width="100%" height="100%">
											<LineChart data={comparison.headToHead.headToHeadDaily}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis
													dataKey="date"
													tickFormatter={(date) =>
														new Date(date).toLocaleDateString("pt-BR", {
															day: "2-digit",
															month: "2-digit",
														})
													}
												/>
												<YAxis />
												<Tooltip
													labelFormatter={(date) =>
														new Date(date).toLocaleDateString("pt-BR")
													}
												/>
												<Legend />
												<Line
													type="monotone"
													dataKey="clan1Kills"
													name={selectedClan1.tag}
													stroke={selectedClan1.color || "#3b82f6"}
													strokeWidth={2}
													dot={{ r: 4 }}
												/>
												<Line
													type="monotone"
													dataKey="clan2Kills"
													name={selectedClan2.tag}
													stroke={selectedClan2.color || "#ef4444"}
													strokeWidth={2}
													dot={{ r: 4 }}
												/>
											</LineChart>
										</ResponsiveContainer>
									</div>
								</CardContent>
							</Card>
						)}

					{/* Head to Head Detailed Stats */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Swords className="h-5 w-5" />
								Estatísticas nos Confrontos Diretos
							</CardTitle>
							<CardDescription>
								Armas, táticas e métricas específicas dos combates entre os dois clans selecionados
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Clan 1 Head to Head Stats */}
								<div className="space-y-4">
									<div className="flex items-center gap-2 mb-4">
										<div
											className="w-3 h-3 rounded-full"
											style={{ backgroundColor: selectedClan1.color || "#888" }}
										/>
										<span className="font-semibold">
											{selectedClan1.tag} vs {selectedClan2.tag}
										</span>
									</div>

									{/* Avg Distance in H2H */}
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											Distância Média
										</span>
										<span className="text-lg font-bold">
											{comparison.headToHead.clan1Stats.avgDistance}m
										</span>
									</div>

									{/* Top Weapons in H2H */}
									<div>
										<div className="text-sm font-semibold mb-2">
											Armas Usadas
										</div>
										<div className="space-y-1">
											{comparison.headToHead.clan1Stats.topWeapons.map(
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
															{weapon.count}x
														</span>
													</div>
												),
											)}
											{comparison.headToHead.clan1Stats.topWeapons.length ===
												0 && (
												<p className="text-xs text-muted-foreground italic">
													Nenhuma arma registrada
												</p>
											)}
										</div>
									</div>

									{/* Top Killers in H2H */}
									<div>
										<div className="text-sm font-semibold mb-2">
											Principais Killers
										</div>
										<div className="space-y-1">
											{comparison.headToHead.clan1Stats.topKillers.map(
												(
													killer: { name: string; kills: number },
													idx: number,
												) => (
													<div
														key={idx}
														className="flex items-center justify-between text-sm"
													>
														<span className="text-muted-foreground font-mono">
															{killer.name}
														</span>
														<span className="font-bold">{killer.kills}</span>
													</div>
												),
											)}
											{comparison.headToHead.clan1Stats.topKillers.length ===
												0 && (
												<p className="text-xs text-muted-foreground italic">
													Nenhum killer registrado
												</p>
											)}
										</div>
									</div>
								</div>

								{/* Clan 2 Head to Head Stats */}
								<div className="space-y-4">
									<div className="flex items-center gap-2 mb-4">
										<div
											className="w-3 h-3 rounded-full"
											style={{ backgroundColor: selectedClan2.color || "#888" }}
										/>
										<span className="font-semibold">
											{selectedClan2.tag} vs {selectedClan1.tag}
										</span>
									</div>

									{/* Avg Distance in H2H */}
									<div className="flex items-center justify-between">
										<span className="text-sm text-muted-foreground">
											Distância Média
										</span>
										<span className="text-lg font-bold">
											{comparison.headToHead.clan2Stats.avgDistance}m
										</span>
									</div>

									{/* Top Weapons in H2H */}
									<div>
										<div className="text-sm font-semibold mb-2">
											Armas Usadas
										</div>
										<div className="space-y-1">
											{comparison.headToHead.clan2Stats.topWeapons.map(
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
															{weapon.count}x
														</span>
													</div>
												),
											)}
											{comparison.headToHead.clan2Stats.topWeapons.length ===
												0 && (
												<p className="text-xs text-muted-foreground italic">
													Nenhuma arma registrada
												</p>
											)}
										</div>
									</div>

									{/* Top Killers in H2H */}
									<div>
										<div className="text-sm font-semibold mb-2">
											Principais Killers
										</div>
										<div className="space-y-1">
											{comparison.headToHead.clan2Stats.topKillers.map(
												(
													killer: { name: string; kills: number },
													idx: number,
												) => (
													<div
														key={idx}
														className="flex items-center justify-between text-sm"
													>
														<span className="text-muted-foreground font-mono">
															{killer.name}
														</span>
														<span className="font-bold">{killer.kills}</span>
													</div>
												),
											)}
											{comparison.headToHead.clan2Stats.topKillers.length ===
												0 && (
												<p className="text-xs text-muted-foreground italic">
													Nenhum killer registrado
												</p>
											)}
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Radar Comparison */}
					<Card>
						<CardHeader>
							<CardTitle>Comparação de Estatísticas</CardTitle>
							<CardDescription>
								Análise multidimensional de performance
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-[400px]">
								<ResponsiveContainer width="100%" height="100%">
									<RadarChart
										data={[
											{
												stat: "K/D Ratio",
												[selectedClan1.tag]: comparison.clan1.kd,
												[selectedClan2.tag]: comparison.clan2.kd,
											},
											{
												stat: "Total Kills",
												[selectedClan1.tag]:
													comparison.clan1.totalKills / 10,
												[selectedClan2.tag]:
													comparison.clan2.totalKills / 10,
											},
											{
												stat: "Dist. Média",
												[selectedClan1.tag]:
													comparison.clan1.avgDistance / 10,
												[selectedClan2.tag]:
													comparison.clan2.avgDistance / 10,
											},
											{
												stat: "Membros",
												[selectedClan1.tag]: comparison.clan1.memberCount,
												[selectedClan2.tag]: comparison.clan2.memberCount,
											},
											{
												stat: "Sequência Max",
												[selectedClan1.tag]: comparison.clan1.maxStreak,
												[selectedClan2.tag]: comparison.clan2.maxStreak,
											},
										]}
									>
										<PolarGrid />
										<PolarAngleAxis dataKey="stat" />
										<PolarRadiusAxis />
										<Radar
											name={selectedClan1.tag}
											dataKey={selectedClan1.tag}
											stroke={selectedClan1.color || "#3b82f6"}
											fill={selectedClan1.color || "#3b82f6"}
											fillOpacity={0.3}
										/>
										<Radar
											name={selectedClan2.tag}
											dataKey={selectedClan2.tag}
											stroke={selectedClan2.color || "#ef4444"}
											fill={selectedClan2.color || "#ef4444"}
											fillOpacity={0.3}
										/>
										<Legend />
									</RadarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>

					{/* Activity by Hour */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="h-5 w-5" />
								Atividade por Hora do Dia
							</CardTitle>
							<CardDescription>
								Quando cada clã é mais ativo
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="h-[300px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={Array.from({ length: 24 }, (_, hour) => ({
											hour: `${hour}h`,
											[selectedClan1.tag]:
												comparison.clan1.hourlyActivity[hour] || 0,
											[selectedClan2.tag]:
												comparison.clan2.hourlyActivity[hour] || 0,
										}))}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="hour" />
										<YAxis />
										<Tooltip />
										<Legend />
										<Bar
											dataKey={selectedClan1.tag}
											fill={selectedClan1.color || "#3b82f6"}
										/>
										<Bar
											dataKey={selectedClan2.tag}
											fill={selectedClan2.color || "#ef4444"}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>

					{/* Overall Stats */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Clan 1 Stats */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<div
										className="w-4 h-4 rounded-full"
										style={{ backgroundColor: selectedClan1.color || "#888" }}
									/>
									<span className="font-mono">[{selectedClan1.tag}]</span>
									{selectedClan1.name}
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
										{comparison.clan1.totalKills}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Target className="h-4 w-4 text-muted-foreground" />
										<span>Total de Mortes</span>
									</div>
									<span className="text-2xl font-bold">
										{comparison.clan1.totalDeaths}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Zap className="h-4 w-4 text-muted-foreground" />
										<span>K/D Ratio</span>
									</div>
									<span className="text-2xl font-bold">
										{comparison.clan1.kd.toFixed(2)}
									</span>
								</div>
								<div className="pt-4 border-t">
									<div className="text-sm font-semibold mb-2">
										Armas Favoritas
									</div>
									<div className="space-y-2">
										{comparison.clan1.topWeapons.map((weapon: { weapon: string | null; count: number }, idx: number) => (
											<div
												key={idx}
												className="flex items-center justify-between text-sm"
											>
												<span>{weapon.weapon || "Desconhecida"}</span>
												<span className="font-mono text-muted-foreground">
													{weapon.count}x
												</span>
											</div>
										))}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Clan 2 Stats */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<div
										className="w-4 h-4 rounded-full"
										style={{ backgroundColor: selectedClan2.color || "#888" }}
									/>
									<span className="font-mono">[{selectedClan2.tag}]</span>
									{selectedClan2.name}
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
										{comparison.clan2.totalKills}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Target className="h-4 w-4 text-muted-foreground" />
										<span>Total de Mortes</span>
									</div>
									<span className="text-2xl font-bold">
										{comparison.clan2.totalDeaths}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Zap className="h-4 w-4 text-muted-foreground" />
										<span>K/D Ratio</span>
									</div>
									<span className="text-2xl font-bold">
										{comparison.clan2.kd.toFixed(2)}
									</span>
								</div>
								<div className="pt-4 border-t">
									<div className="text-sm font-semibold mb-2">
										Armas Favoritas
									</div>
									<div className="space-y-2">
										{comparison.clan2.topWeapons.map((weapon: { weapon: string | null; count: number }, idx: number) => (
											<div
												key={idx}
												className="flex items-center justify-between text-sm"
											>
												<span>{weapon.weapon || "Desconhecida"}</span>
												<span className="font-mono text-muted-foreground">
													{weapon.count}x
												</span>
											</div>
										))}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Advanced Statistics */}
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
										style={{ color: selectedClan1.color || undefined }}
									>
										{comparison.clan1.avgDistance}m
									</div>
									<div className="text-xs text-muted-foreground">
										{selectedClan1.tag}
									</div>
								</div>
								<div className="text-center border-t pt-4">
									<div
										className="text-3xl font-bold"
										style={{ color: selectedClan2.color || undefined }}
									>
										{comparison.clan2.avgDistance}m
									</div>
									<div className="text-xs text-muted-foreground">
										{selectedClan2.tag}
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
										style={{ color: selectedClan1.color || undefined }}
									>
										{comparison.clan1.mostActiveHour}:00
									</div>
									<div className="text-xs text-muted-foreground">
										{selectedClan1.tag}
									</div>
								</div>
								<div className="text-center border-t pt-4">
									<div
										className="text-3xl font-bold"
										style={{ color: selectedClan2.color || undefined }}
									>
										{comparison.clan2.mostActiveHour}:00
									</div>
									<div className="text-xs text-muted-foreground">
										{selectedClan2.tag}
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Streak */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base flex items-center gap-2">
									<TrendingUp className="h-4 w-4" />
									Maior Sequência (vs oponente)
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="text-center">
									<div
										className="text-3xl font-bold"
										style={{ color: selectedClan1.color || undefined }}
									>
										{comparison.clan1.maxStreak}
									</div>
									<div className="text-xs text-muted-foreground">
										{selectedClan1.tag}
									</div>
								</div>
								<div className="text-center border-t pt-4">
									<div
										className="text-3xl font-bold"
										style={{ color: selectedClan2.color || undefined }}
									>
										{comparison.clan2.maxStreak}
									</div>
									<div className="text-xs text-muted-foreground">
										{selectedClan2.tag}
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
									Kill Mais Longo - {selectedClan1.tag}
								</CardTitle>
							</CardHeader>
							<CardContent>
								{comparison.clan1.longestKill ? (
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground">Distância:</span>
											<span className="font-bold">
												{comparison.clan1.longestKill.distance}m
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Killer:</span>
											<span className="font-mono">
												{comparison.clan1.longestKill.killer}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Victim:</span>
											<span className="font-mono">
												{comparison.clan1.longestKill.victim}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Arma:</span>
											<span>{comparison.clan1.longestKill.weapon}</span>
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
									Kill Mais Longo - {selectedClan2.tag}
								</CardTitle>
							</CardHeader>
							<CardContent>
								{comparison.clan2.longestKill ? (
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-muted-foreground">Distância:</span>
											<span className="font-bold">
												{comparison.clan2.longestKill.distance}m
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Killer:</span>
											<span className="font-mono">
												{comparison.clan2.longestKill.killer}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Victim:</span>
											<span className="font-mono">
												{comparison.clan2.longestKill.victim}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Arma:</span>
											<span>{comparison.clan2.longestKill.weapon}</span>
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

					{/* Best Days */}
					{(comparison.clan1.bestDay || comparison.clan2.bestDay) && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Calendar className="h-5 w-5" />
									Melhor Dia de Performance
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<div className="text-sm font-semibold mb-2">
											{selectedClan1.tag}
										</div>
										{comparison.clan1.bestDay ? (
											<div className="space-y-1">
												<div className="text-2xl font-bold">
													{comparison.clan1.bestDay.kills} kills
												</div>
												<div className="text-sm text-muted-foreground">
													{new Date(comparison.clan1.bestDay.date).toLocaleDateString(
														"pt-BR",
													)}
												</div>
											</div>
										) : (
											<p className="text-sm text-muted-foreground">
												Nenhum registro
											</p>
										)}
									</div>
									<div>
										<div className="text-sm font-semibold mb-2">
											{selectedClan2.tag}
										</div>
										{comparison.clan2.bestDay ? (
											<div className="space-y-1">
												<div className="text-2xl font-bold">
													{comparison.clan2.bestDay.kills} kills
												</div>
												<div className="text-sm text-muted-foreground">
													{new Date(comparison.clan2.bestDay.date).toLocaleDateString(
														"pt-BR",
													)}
												</div>
											</div>
										) : (
											<p className="text-sm text-muted-foreground">
												Nenhum registro
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
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
									Histórico cronológico dos últimos 10 combates diretos entre os clans
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
											const isClann1Kill = clan1Id
												? comparison.clan1.name &&
												  battle.killer.includes(selectedClan1.tag)
												: false;
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
																	backgroundColor: isClann1Kill
																		? selectedClan1.color || "#888"
																		: selectedClan2.color || "#888",
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
														<div className="flex items-center gap-3 text-xs text-muted-foreground">
															<span>{battle.weapon || "Arma desconhecida"}</span>
															<span>•</span>
															<span>
																{typeof battle.distance === "number"
																	? `${Math.round(battle.distance)}m`
																	: `${battle.distance || 0}m`}
															</span>
															<span>•</span>
															<span>
																{new Date(battle.timestamp).toLocaleString(
																	"pt-BR",
																	{
																		day: "2-digit",
																		month: "2-digit",
																		hour: "2-digit",
																		minute: "2-digit",
																	},
																)}
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

			{!comparison && clan1Id && clan2Id && clan1Id === clan2Id && (
				<Card>
					<CardContent className="py-12 text-center text-muted-foreground">
						Por favor, selecione dois clãs diferentes para comparar
					</CardContent>
				</Card>
			)}

			{!comparison && (!clan1Id || !clan2Id) && (
				<Card>
					<CardContent className="py-12 text-center text-muted-foreground">
						Selecione dois clãs acima para ver a comparação
					</CardContent>
				</Card>
			)}
		</div>
	);
}
