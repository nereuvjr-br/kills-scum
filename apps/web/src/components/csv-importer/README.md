# CSV Importer para Killfeeds

Sistema completo de importação de dados de kills a partir de arquivos CSV para o Appwrite, com detecção de duplicatas e limpeza de dados.

## 📋 Características

- ✅ **Upload de CSV**: Interface para selecionar e fazer upload de arquivos CSV
- ✅ **Limpeza de Dados**: Remove automaticamente emoticons (😎 e 😭) dos nomes
- ✅ **Detecção de Duplicatas**: Identifica e pula registros duplicados por `idDiscord`
- ✅ **Validação Dupla**: 
  - Verifica duplicatas no banco de dados existente
  - Detecta duplicatas dentro do próprio arquivo (batch)
- ✅ **Relatório Detalhado**: Mostra estatísticas e lista todos os registros pulados
- ✅ **Tratamento de Erros**: Registra e exibe erros de importação

## 🏗️ Estrutura de Arquivos

```
apps/web/src/
├── app/
│   ├── import/
│   │   └── page.tsx              # Página de importação
│   └── page.tsx                  # Home (atualizada com link)
└── components/
    └── csv-importer/
        ├── csv-importer.tsx       # Componente React principal
        ├── csv-parser.ts          # Funções de parsing e processamento
        └── appwrite-service.ts    # Serviço de integração com Appwrite
```

## 🚀 Como Usar

### 1. Acessar a Interface

```
http://localhost:3001/import
```

### 2. Preparar o Arquivo CSV

O arquivo deve ter as seguintes colunas (na ordem):

```
id, createdAt, updatedAt, kill, victim, distance, weapon, timestamp, idDiscord
```

**Exemplo:**
```csv
id,createdAt,updatedAt,kill,victim,distance,weapon,timestamp,idDiscord
1,2025-10-23T17:39:35.663Z,2025-10-23T17:39:35.663Z,😎 Killer Name,😭 Victim Name,50m,AK47,2025-10-23T17:10:03.090Z,1430966514336665670
```

### 3. Fazer Upload

1. Clique no input de arquivo
2. Selecione o arquivo CSV
3. O sistema automaticamente:
   - Parse o CSV
   - Remove emoticons
   - Busca duplicatas no banco
   - Importa os registros válidos

### 4. Verificar Resultados

A interface mostra:

- **Resumo da Importação**
  - Total de linhas
  - Duplicatas no banco
  - Duplicatas no batch
  - Registros importados
  - Registros com falha

- **Tabela de Duplicatas** (se houver)
  - Linha do arquivo
  - ID Discord
  - Killer / Victim
  - Tipo (Banco ou Batch)

- **Erros** (se houver)
  - Lista detalhada de erros

## 📝 Fluxo de Processamento

```
1. Upload CSV
   ↓
2. Parse CSV → Validar estrutura
   ↓
3. Processar Dados → Remover emoticons (😎 😭)
   ↓
4. Buscar IDs Existentes → Consultar Appwrite
   ↓
5. Detectar Duplicatas
   ├─ Duplicatas no banco → Pula
   ├─ Duplicatas no batch → Pula
   └─ Únicos → Segue para importação
   ↓
6. Importar Registros → Salvar no Appwrite
   ↓
7. Relatório → Mostrar estatísticas
```

## 🔧 Configuração

As variáveis de ambiente necessárias estão no `.env`:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=68ef2d40000e144b455c
NEXT_PUBLIC_APPWRITE_TOKEN=standard_...
NEXT_PUBLIC_APPWRITE_DATABASE_KILLS=68fb7b1600176df85af0
NEXT_PUBLIC_APPWRITE_COLLECTION_KILLFEEDS=killfeeds
```

## 📊 Estrutura dos Dados no Appwrite

**Collection**: `killfeeds`
**Database**: `scum-kills`

Campos:
- `killer`: string (250) - Nome do matador (sem emoticons)
- `victim`: string (250) - Nome da vítima (sem emoticons)
- `distance`: string (250) - Distância
- `weapon`: string (250) - Arma usada
- `timestamp`: datetime - Data/hora do kill
- `idDiscord`: integer - ID do Discord (ÚNICO - sem duplicatas)
- `Clan`: string (250) - Clan (vazio por padrão)

## 🛡️ Validações

1. **CSV Parsing**
   - Valida headers obrigatórios
   - Verifica linha por linha

2. **Limpeza de Dados**
   - Remove `😎` de killers
   - Remove `😭` de victims
   - Remove espaços extras

3. **Duplicatas**
   - Compara `idDiscord` com banco existente
   - Detecta duplicatas dentro do arquivo

4. **Importação**
   - Try-catch em cada registro
   - Continua mesmo com erros parciais
   - Registra todas as falhas

## 📈 Exemplo de Resultado

```
Resumo da Importação
├─ Total de Linhas: 100
├─ Duplicatas (DB): 12
├─ Duplicatas (Batch): 3
├─ Será Importado: 85
├─ Importados ✓: 85
└─ Falhas ✗: 0

Registros Duplicados (15)
├─ Linha 5: ID 1430966514336665670 (Banco)
├─ Linha 12: ID 1430965010133160097 (Banco)
├─ Linha 45: ID 1430965010133160097 (Batch)
└─ ...
```

## ⚠️ Tratamento de Erros

Possíveis erros e como são tratados:

| Erro | Causa | Ação |
|------|-------|------|
| CSV inválido | Headers faltando | Mostra erro e pára |
| Erro de conexão | Appwrite indisponível | Mostra mensagem de erro |
| ID Discord duplicado (DB) | Já existe no banco | Pula registro |
| ID Discord duplicado (Batch) | Repetido no arquivo | Pula registro |
| Erro na importação | API error | Registra e continua |

## 🧪 Testing

Para testar a importação:

1. Crie um arquivo CSV com dados de teste
2. Certifique-se que o Appwrite está acessível
3. Acesse `/import`
4. Faça upload do arquivo
5. Verifique o relatório

## 📝 Notas Importantes

- **idDiscord é ÚNICO**: Sem duplicatas são permitidas no banco
- **Emoticons são removidos**: Dados ficam limpos
- **Operação é segura**: Não overwrite dados existentes
- **Relatório completo**: Você sabe exatamente o que foi feito
- **Importação é transacional por item**: Falha em um não afeta os outros

## 🔗 Links Relacionados

- Página de Importação: `/import`
- Script de Info Appwrite: `scripts/list-appwrite-info.ts`
- Documentação CSV Parser: `csv-parser.ts`
- Documentação Appwrite Service: `appwrite-service.ts`
