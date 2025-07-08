# Lead Qualification Dashboard

This is a full-stack application designed to help a startup sales team qualify, analyze, and manage incoming demo-request leads. The project features a modern React + TypeScript frontend, a robust Python (FastAPI) backend, event tracking for user interactions, and an AI-powered data enrichment feature.


---

## ✨ Key Features

* **Interactive Dashboard:** A sleek, modern UI built with React and TypeScript for real-time data visualization.
* **Dynamic Filtering:** Filter leads by industry and company size to narrow down results.
* **Multiple Views:** Seamlessly toggle between a detailed **Table View** and a visual **Charts View** (with both Pie and Bar charts).
* **AI-Powered Enrichment:** An optional toggle uses the Google Gemini API to analyze each lead, providing a "Quality" rating and a one-sentence "Summary" directly in the table.
* **User Event Tracking:** All significant user interactions (filtering, view changes, etc.) are logged to a database for future analysis.

---

## 🚀 Setup & Run Instructions

To run this project locally, you will need two separate terminals: one for the backend server and one for the frontend client.

### 1. Backend Setup (Python)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    * **On Windows:**
        ```bash
        python -m venv venv
        venv\Scripts\activate
        ```
    * **On Mac/Linux:**
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```

3.  **Install the required packages:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up your AI API Key:**
    * Get a free API key from **[Google AI Studio](https://aistudio.google.com/)**.
    * Create a new file named `.env` in the `/backend` folder.
    * Add your key to the file like this: `GEMINI_API_KEY="YOUR_KEY_HERE"`

5.  **Generate and Load Data:**
    * From the **root project folder**, run the data generation script:
        ```bash
        # (If you are in the backend folder, go up one directory: cd ..)
        python data/generate_data.py
        ```
    * Navigate back into the backend folder and populate the database:
        ```bash
        # (Go back into the backend folder: cd backend)
        python load_initial_data.py
        ```

6.  **Run the FastAPI server:**
    ```bash
    uvicorn app:app --reload
    ```
    The backend server will now be running at `http://localhost:8000`.

### 2. Frontend Setup (React)

1.  **Open a new terminal** and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  **Install the required node modules:**
    ```bash
    npm install
    ```
3.  **Run the React development server:**
    ```bash
    npm run dev
    ```
The frontend application will now be available at `http://localhost:5173` (or a similar port).

---

## 🧮 SQL Queries & Results

The following SQL queries were used to analyze user interaction events stored in the `events` table of the `leads.db` database.

*(**Note:** To run these queries, open the `backend/leads.db` file with a tool like [DB Browser for SQLite](https://sqlitebrowser.org/dl/))*

### Most-Used Filters

This query identifies which filters (Industry or Company Size) are used most frequently by the sales team.

**Query:**
```sql
SELECT
  json_extract(event_data, '$.filterType') AS filter,
  COUNT(*) AS uses
FROM events
WHERE
  action = 'filter' AND
  occurred_at >= datetime('now', '-7 days')
GROUP BY filter
ORDER BY uses DESC
LIMIT 3;
```

**Results:**

| filter   | uses |
|----------|------|
| size     | 29   |
| industry | 9    |


### View Preference: Table vs. Charts

This query calculates the percentage of time users spend in the "Table" view versus the "Charts" view.

**Query:**
```sql
SELECT
  CASE
    WHEN json_extract(event_data, '$.view') = 'chart' THEN 'charts'
    ELSE json_extract(event_data, '$.view')
  END AS view_type,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM events WHERE action = 'toggle_view'), 2) AS percentage
FROM events
WHERE action = 'toggle_view'
GROUP BY view_type;
```

**Results:**
| view_type | percentage |
|-----------|------------|
| table     | 49.29      |
| charts    | 50.71      |


---

## 🤖 LLM Integration

### LLM Prompt Design

To enrich the lead data, the following prompt was designed to classify lead quality and generate a concise company summary. The prompt instructs the model to return a clean JSON object for easy parsing.

```python
prompt = f"""
Analyze the following sales lead and provide a JSON object with two keys: "quality" and "summary".
- The "quality" should be "High", "Medium", or "Low". High-quality leads are in Technology or Finance with over 100 employees. Medium are in Healthcare or Manufacturing with 50-100 employees. All others are Low.
- The "summary" should be a single, concise sentence describing the company based on its name and industry.
Lead Data:
- Company Name: {lead.company}
- Industry: {lead.industry}
- Employee Size: {lead.size}
Respond with only the raw JSON object.
"""
```

### Sample Enriched Payload

Here is an example of a lead object after being enriched by the LLM API.

```json
{
  "id": 1,
  "name": "Alice Smith",
  "company": "Innovatech Solutions",
  "industry": "Technology",
  "size": 250,
  "source": "Organic",
  "created_at": "2025-07-01T10:23:00Z",
  "quality": "High",
  "summary": "Innovatech Solutions is a forward-thinking company operating in the technology sector."
}
