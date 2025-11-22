# Net Effective Rent (NER) Calculator

A professional-grade commercial real estate calculator designed to determine the Net Effective Rent (NER) and Landlord Payback Period for office and industrial leases.

## Features

*   **Net Effective Rent (NER) Calculation**: Uses a discounted cash flow (DCF) model with an annuity due formula (payments at start of period).
*   **Dynamic Rent Schedule**: Supports lease terms up to 20 years with automatic column adjustment.
*   **Rent Escalations**: Supports fixed % increase, fixed $ increase, or manual entry.
*   **Commission Models**:
    *   **Office**: $/SF/Year calculation.
    *   **Industrial**: Split percentage (Year 1 vs Year 2+) calculation.
*   **Incentive Analysis**:
    *   Calculates Total Concessions (Free Rent + TI + Landlord Work).
    *   Calculates Incentives as a % of Year 1 Gross Rent.
    *   Calculates Landlord Payback Period (Breakeven).
*   **Free Rent Types**: Supports both Net Free Rent (standard) and Gross Free Rent (landlord pays TMI).

## How to Use

1.  **Open the Calculator**: Simply open `index.html` in any modern web browser.
2.  **Input Lease Parameters**: Enter the lease term, square footage, and financial details.
3.  **View Results**: The dashboard updates in real-time to show NER, NPV, and key metrics.

## Technologies

*   HTML5
*   CSS3 (Modern Grid/Flexbox, Glassmorphism UI)
*   Vanilla JavaScript (No frameworks required)
*   Chart.js (for cash flow visualization)

## Deployment

This is a static web project. You can host it for free on:
*   **Netlify**: Drag and drop the project folder to [Netlify Drop](https://app.netlify.com/drop).
*   **GitHub Pages**: Push this repository to GitHub and enable GitHub Pages.
*   **Vercel**: Import the project from GitHub or use the Vercel CLI.
