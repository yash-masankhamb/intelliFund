# IntelliFund – Mutual Fund Advisor

## 📌 Overview

**IntelliFund** is a mutual fund advisory platform designed to help new investors understand mutual funds and identify schemes that align with their **risk tolerance and financial goals**.

The platform combines **real-world mutual fund data sourced from AMFI**, financial performance analysis, and a user risk-profiling system to generate personalized fund recommendations.

---

## 🎯 Problem Statement

For new investors, choosing suitable mutual funds can be difficult because thousands of schemes are available, each with different levels of **risk, return, volatility, and performance**.

IntelliFund aims to simplify this process by:

* Understanding the investor's risk tolerance and financial goals.
* Processing and analyzing mutual fund data.
* Categorizing funds based on their risk-return characteristics.
* Matching investors with suitable mutual fund schemes.

---

## ⚙️ What IntelliFund Does

The platform follows a simple workflow:

**Investor → Risk Questionnaire → Risk Score → Fund Matching → Recommendations**

1. The user completes a questionnaire based on their **risk tolerance and financial goals**.
2. IntelliFund calculates a **risk score** for the investor.
3. Mutual funds are analyzed using historical NAV and performance data.
4. Funds are organized into different **risk categories/buckets**.
5. The investor's risk profile is matched with appropriate funds.
6. The platform presents the relevant mutual fund recommendations.

---

## 🏗️ Basic System Architecture

```text
                    ┌─────────────────────┐
                    │       AMFI Data     │
                    │  Mutual Fund + NAV  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Data Pipeline      │
                    │ Clean → Transform    │
                    │ → Validate → Store   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Financial Analysis  │
                    │ CAGR • Volatility    │
                    │ Sharpe • Risk Metrics│
                    └──────────┬──────────┘
                               │
                               ▼
┌───────────────┐     ┌─────────────────────┐
│    Investor   │────▶│   Risk Profiling    │
│ Questionnaire │     │    & Risk Score     │
└───────────────┘     └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │   Fund Matching     │
                       │  & Recommendations  │
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │      Frontend       │
                       │  Investor Dashboard │
                       └─────────────────────┘
```

---

## 📊 AMFI Data Pipeline

One of the core components of IntelliFund is its **mutual fund data pipeline**.

The pipeline retrieves mutual fund and NAV data from the **Association of Mutual Funds in India (AMFI)** and processes it into a structured format that can be used by the application.

### Pipeline Flow

**AMFI Data → Extraction → Cleaning → Transformation → Validation → Storage → Analysis**

The pipeline handles tasks such as:

* Extracting mutual fund and historical NAV data.
* Cleaning and standardizing the raw data.
* Handling missing or inconsistent records.
* Structuring the data for analysis.
* Calculating performance and risk metrics.
* Storing the processed dataset for use by the application.

This allows IntelliFund to work with a structured dataset instead of directly relying on raw financial data.

---

## 📈 Financial Analysis

The processed mutual fund data is used to calculate important performance and risk metrics, including:

* **CAGR** – Compound Annual Growth Rate
* **Volatility** – Measure of return fluctuations
* **Sharpe Ratio** – Risk-adjusted return
* **Maximum Drawdown** – Measure of historical downside

These metrics help IntelliFund evaluate the **risk-return characteristics** of individual mutual fund schemes.

---

## 🧠 Risk Profiling

IntelliFund uses a questionnaire to understand the investor's:

* Risk tolerance
* Investment objectives
* Financial goals
* Investment preferences

The responses are converted into a **risk score**, which is then used to determine the appropriate fund category for the investor.

---

## 🛠️ Technology Stack

**Backend & Data Processing**

* Python
* REST APIs

**Database**

* PostgreSQL

**Data Source**

* AMFI

**Development Tools**

* Git
* GitHub

**Frontend**

* React
* TypeScript
* Tailwind CSS

---

## 🚀 Future Enhancements

Planned improvements include:

* AI-powered chatbot for investor assistance.
* Portfolio creation and analysis.
* Portfolio risk and growth analysis.
* More personalized investment insights.
* Additional financial analytics.

---

## 📌 Project Goal

The goal of IntelliFund is to make mutual fund analysis **simpler, data-driven, and more accessible for new investors** by combining structured financial data with personalized risk profiling.
