# CSV Parser - API Reference

## Funções Principais

### `parseCSV(csvContent: string): RawKillData[]`

Faz o parse de um conteúdo CSV em formato string.

**Parâmetros:**
- `csvContent`: Conteúdo do arquivo CSV como string

**Retorna:**
- Array de `RawKillData` com os dados parseados

**Validações:**
- ✅ Verifica se arquivo não está vazio
- ✅ Valida headers obrigatórios
- ✅ Ignora linhas vazias

**Exemplo:**
```typescript
const csvContent = await file.text();
const data = parseCSV(csvContent);
```

---

### `processKillData(rawData: RawKillData[]): ProcessedKillData[]`

Processa os dados brutos removendo emoticons.

**Parâmetros:**
- `rawData`: Array de dados brutos do CSV

**Retorna:**
- Array de `ProcessedKillData` com dados limpos

**Transformações:**
- ✅ Remove `😎` dos nomes de killers
- ✅ Remove `😭` dos nomes de vítimas
- ✅ Remove espaços extras

**Exemplo:**
```typescript
const processed = processKillData(rawData);
// { killer: "Player1", victim: "Player2", ... }
```

---

### `removeEmoticons(text: string): string`

Remove emoticons específicos de um texto.

**Parâmetros:**
- `text`: Texto que pode conter emoticons

**Retorna:**
- String limpa sem emoticons

**Emoticons Removidos:**
- 😎 (smile/cool face)
- 😭 (sad/crying face)

**Exemplo:**
```typescript
removeEmoticons("😎 Player Name");
// "Player Name"
```

---

### `findDuplicates(data: ProcessedKillData[], existingIdDiscords: Set<string>)`

Detecta duplicatas comparando com registros existentes e no próprio batch.

**Parâmetros:**
- `data`: Array de dados processados
- `existingIdDiscords`: Set de IDs Discord já existentes no banco

**Retorna:**
```typescript
{
  unique: ProcessedKillData[],  // Registros únicos
  duplicates: [{
    rowNumber: number,
    data: ProcessedKillData,
    type: 'database' | 'batch'
  }]
}
```

**Lógica:**
1. Verifica cada registro contra registros do banco
2. Verifica duplicatas dentro do próprio arquivo
3. Separa em dois grupos: únicos e duplicatas

**Exemplo:**
```typescript
const existing = await getExistingIdDiscords();
const { unique, duplicates } = findDuplicates(processed, existing);

duplicates.forEach(dup => {
  console.log(`Linha ${dup.rowNumber}: ${dup.type}`);
});
```

---

## Interfaces de Dados

### `RawKillData`
```typescript
interface RawKillData {
  id: string;                // ID da linha CSV
  createdAt: string;         // Timestamp de criação
  updatedAt: string;         // Timestamp de atualização
  kill: string;              // Nome do killer (com emoticon)
  victim: string;            // Nome da vítima (com emoticon)
  distance: string;          // Distância (ex: "50m")
  weapon: string;            // Arma usada
  timestamp: string;         // Data/hora do kill
  idDiscord: string;         // ID Discord (único)
}
```

### `ProcessedKillData`
```typescript
interface ProcessedKillData {
  killer: string;            // Nome do killer (sem emoticon)
  victim: string;            // Nome da vítima (sem emoticon)
  distance: string;          // Distância
  weapon: string;            // Arma usada
  timestamp: string;         // Data/hora do kill
  idDiscord: string;         // ID Discord (único)
}
```

### `ImportResult`
```typescript
interface ImportResult {
  success: boolean;
  imported: number;          // Quantidade importada
  duplicates: [{
    rowNumber: number;       // Número da linha no arquivo
    idDiscord: string;       // ID Discord
    killer: string;          // Nome do killer
    victim: string;          // Nome da vítima
    reason: string;          // Motivo do skip
  }];
  errors: [{
    rowNumber: number;
    error: string;
  }];
}
```

---

## Serviço Appwrite

### `getExistingIdDiscords(): Promise<Set<string>>`

Busca todos os `idDiscord` já existentes no banco.

**Retorna:**
- Set de strings com IDs Discord existentes

**Paginação:**
- Automática - busca 100 registros por vez
- Continua até encontrar todos

**Exemplo:**
```typescript
const existing = await getExistingIdDiscords();
// Set { "1111111111111111111", "2222222222222222222", ... }
```

---

### `importKillData(data: ImportKillData): Promise<string>`

Importa um registro individual de kill para o Appwrite.

**Parâmetros:**
- `data`: Objeto com dados do kill

**Retorna:**
- ID do documento criado no Appwrite

**Campos Enviados:**
```typescript
{
  killer: string,            // Nome do killer
  victim: string,            // Nome da vítima
  distance: string,          // Distância
  weapon: string,            // Arma
  timestamp: string,         // Data/hora
  idDiscord: number,         // ID Discord como número
  Clan: string              // Vazio por padrão
}
```

**Exemplo:**
```typescript
const docId = await importKillData({
  killer: "Player1",
  victim: "Player2",
  distance: "50m",
  weapon: "AK47",
  timestamp: "2025-10-24T14:59:00Z",
  idDiscord: "1111111111111111111"
});
```

---

### `importMultipleKillData(data: ImportKillData[]): Promise<{ success: number; failed: number; errors: string[] }>`

Importa múltiplos registros com tratamento de erros.

**Parâmetros:**
- `data`: Array de ImportKillData

**Retorna:**
```typescript
{
  success: number,           // Quantidade importada com sucesso
  failed: number,            // Quantidade com falha
  errors: string[]           // Mensagens de erro detalhadas
}
```

**Comportamento:**
- ✅ Continua mesmo com erros
- ✅ Não usa transação (cada item é independente)
- ✅ Registra todos os erros

**Exemplo:**
```typescript
const result = await importMultipleKillData(uniqueRecords);
console.log(`Importados: ${result.success}, Falhados: ${result.failed}`);
result.errors.forEach(err => console.error(err));
```

---

## Fluxo Típico de Uso

```typescript
// 1. Ler arquivo
const file = event.target.files[0];
const content = await file.text();

// 2. Parse e validação
const rawData = parseCSV(content);

// 3. Processar (limpar emoticons)
const processed = processKillData(rawData);

// 4. Buscar duplicatas no banco
const existing = await getExistingIdDiscords();

// 5. Detectar duplicatas
const { unique, duplicates } = findDuplicates(processed, existing);

// 6. Importar únicos
const result = await importMultipleKillData(unique);

// 7. Exibir relatório
console.log(`Importados: ${result.success}`);
duplicates.forEach(d => {
  console.log(`Linha ${d.rowNumber}: ${d.type}`);
});
```

---

## Tratamento de Erros

### Erros Possíveis

1. **CSV Inválido**
   - Headers faltando
   - Arquivo vazio
   ```typescript
   try {
     const data = parseCSV(content);
   } catch (e) {
     console.error("CSV inválido:", e.message);
   }
   ```

2. **Erro de Conexão**
   - Appwrite indisponível
   ```typescript
   try {
     const existing = await getExistingIdDiscords();
   } catch (e) {
     console.error("Erro ao conectar com Appwrite:", e);
   }
   ```

3. **Erro na Importação**
   - Validação de dados falhou
   - Permissões insuficientes
   - Campo obrigatório vazio

---

## Exemplos Práticos

### Exemplo 1: Importação Simples

```typescript
async function simpleImport(csvFile: File) {
  const content = await csvFile.text();
  const raw = parseCSV(content);
  const processed = processKillData(raw);
  const existing = await getExistingIdDiscords();
  const { unique } = findDuplicates(processed, existing);
  return await importMultipleKillData(unique);
}
```

### Exemplo 2: Com Relatório

```typescript
async function importWithReport(csvFile: File) {
  const content = await csvFile.text();
  const raw = parseCSV(content);
  const processed = processKillData(raw);
  const existing = await getExistingIdDiscords();
  const { unique, duplicates } = findDuplicates(processed, existing);
  const result = await importMultipleKillData(unique);
  
  return {
    total: raw.length,
    imported: result.success,
    duplicates: duplicates.length,
    errors: result.errors,
    errorRate: (result.failed / unique.length * 100).toFixed(2)
  };
}
```

### Exemplo 3: Processamento em Lotes

```typescript
async function batchImport(files: File[]) {
  const results = [];
  
  for (const file of files) {
    const content = await file.text();
    const raw = parseCSV(content);
    const processed = processKillData(raw);
    const existing = await getExistingIdDiscords();
    const { unique } = findDuplicates(processed, existing);
    const result = await importMultipleKillData(unique);
    
    results.push({
      file: file.name,
      imported: result.success,
      failed: result.failed
    });
  }
  
  return results;
}
```

---

## Performance

| Operação | Tempo Estimado |
|----------|---|
| Parse CSV (1000 linhas) | ~50ms |
| Processar emoticons | ~10ms |
| Buscar IDs existentes | ~200-500ms |
| Detectar duplicatas | ~20ms |
| Importar 100 registros | ~2-5s |

---

## Conclusão

O sistema fornece uma API robusta e bem estruturada para:
- ✅ Parse e validação de CSV
- ✅ Limpeza de dados
- ✅ Detecção de duplicatas
- ✅ Importação segura
- ✅ Relatórios detalhados
