# 🛡️ IncidentResponse Lab

**Simulador de Respuesta ante Incidentes de Phishing Financiero**

Prototipo de bajo nivel desarrollado para el curso Proyecto de Ingeniería I (UNAD, 2026).
enfocándose en la **reacción y mitigación** cuando el incidente ya ocurrió.

## 🎯 Diferenciador
Mientras los otros prototipos enseñan a **NO caer** en phishing, este enseña
**qué hacer cuando ya caíste o estás a punto de caer**.

## 🚀 Cómo ejecutar

### GitHub Pages
1. Accede a https://henryvcxd.github.io/incident-response-lab/
   *(Recomendado para dispositivos móviles y de escritorio. No requiere registro ni datos personales).*

## 🧪 Plan de pruebas experimentales

**Prueba en:** 10 usuarios (familiares, amigos, compañeros).

**Protocolo por usuario:**
1. Briefing de 2 minutos (NO explicar respuestas correctas).
2. Ejecutar los 7 escenarios en orden.
3. Exportar CSV al finalizar.
4. Registrar en tabla maestra:
   - ID usuario (anonimizado: U1, U2, U3...)
   - TPR (tiempo promedio)
   - TAC (tasa de acierto)
   - CE (costo evitado)
   - DPO (desviación protocolo)

**KPIs meta:**
| KPI | Fórmula | Meta |
|---|---|---|
| TPR | Σtiempo / n° decisiones | < 15 s |
| TAC | (óptimas / total) × 100 | ≥ 80% |
| CE | $2.500.000 - costo real | ≥ $300.000 COP |
| DPO | (no óptimas / total) × 100 | ≤ 20% |

## 🔒 Privacidad (IEEE 7000-2021)
- Cero recolección de PII.
- Todo se procesa en el navegador del usuario.
- Los datos solo existen si el usuario exporta el CSV manualmente.

## 📚 ODS asociados
- **ODS 4** (Educación de calidad): meta 4.4 y 4.7.
- **ODS 9** (Industria, innovación e infraestructura).
- **ODS 16** (Paz, justicia e instituciones sólidas).

## 👨‍💻 Autor
Henry Vargas Cruz

Proyecto colaborativo Grupo 429 · UNAD 2026
