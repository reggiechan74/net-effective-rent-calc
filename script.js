document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const inputs = {
        leaseTerm: document.getElementById('leaseTerm'),
        squareFootage: document.getElementById('squareFootage'),
        tmiPsf: document.getElementById('tmiPsf'),
        freeRent: document.getElementById('freeRent'),
        freeRentType: document.getElementById('freeRentType'),
        tiAllowance: document.getElementById('tiAllowance'),
        landlordWork: document.getElementById('landlordWork'),
        listingFee: document.getElementById('listingFee'),
        tenantRepFee: document.getElementById('tenantRepFee'),
        listingFeeIndYr1: document.getElementById('listingFeeIndYr1'),
        listingFeeIndYr2: document.getElementById('listingFeeIndYr2'),
        tenantRepFeeIndYr1: document.getElementById('tenantRepFeeIndYr1'),
        tenantRepFeeIndYr2: document.getElementById('tenantRepFeeIndYr2'),
        discountRate: document.getElementById('discountRate'),
        rentInputs: document.querySelectorAll('.rent-input'),
        commModelRadios: document.getElementsByName('commModel'),
        escModelRadios: document.getElementsByName('escMethod'),
        startBaseRent: document.getElementById('startBaseRent'),
        escPctValue: document.getElementById('escPctValue'),
        escFixedValue: document.getElementById('escFixedValue')
    };

    const containers = {
        officeInputs: document.getElementById('officeInputs'),
        industrialInputs: document.getElementById('industrialInputs'),
        autoEscInputs: document.getElementById('autoEscInputs'),
        pctInputGroup: document.getElementById('pctInputGroup'),
        fixedInputGroup: document.getElementById('fixedInputGroup')
    };

    const outputs = {
        nerValue: document.getElementById('nerValue'),
        npvValue: document.getElementById('npvValue'),
        totalValue: document.getElementById('totalValue'),
        avgMonthly: document.getElementById('avgMonthly'),
        totalConcessions: document.getElementById('totalConcessions'),
        incentivesPct: document.getElementById('incentivesPct'),
        paybackMonths: document.getElementById('paybackMonths'),
        breakdownTableBody: document.querySelector('#breakdownTable tbody')
    };

    const toggleBreakdownBtn = document.getElementById('toggleBreakdown');
    const breakdownContainer = document.getElementById('breakdownTableContainer');
    let chartInstance = null;

    // Event Listeners
    inputs.leaseTerm.addEventListener('input', calculate);
    inputs.squareFootage.addEventListener('input', calculate);
    inputs.tmiPsf.addEventListener('input', calculate);
    inputs.freeRent.addEventListener('input', calculate);
    inputs.freeRentType.addEventListener('change', calculate);
    inputs.tiAllowance.addEventListener('input', calculate);
    inputs.landlordWork.addEventListener('input', calculate);
    inputs.listingFee.addEventListener('input', calculate);
    inputs.tenantRepFee.addEventListener('input', calculate);
    inputs.listingFeeIndYr1.addEventListener('input', calculate);
    inputs.listingFeeIndYr2.addEventListener('input', calculate);
    inputs.tenantRepFeeIndYr1.addEventListener('input', calculate);
    inputs.tenantRepFeeIndYr2.addEventListener('input', calculate);
    inputs.discountRate.addEventListener('input', calculate);

    // Escalation Inputs
    inputs.startBaseRent.addEventListener('input', updateRentSchedule);
    inputs.escPctValue.addEventListener('input', updateRentSchedule);
    inputs.escFixedValue.addEventListener('input', updateRentSchedule);

    inputs.rentInputs.forEach(input => {
        input.addEventListener('input', calculate);
    });

    // Escalation Model Toggle
    inputs.escModelRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            handleEscalationModeChange(e.target.value);
        });
    });

    // Commission Model Toggle
    inputs.commModelRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'office') {
                containers.officeInputs.classList.remove('hidden');
                containers.industrialInputs.classList.add('hidden');
            } else {
                containers.officeInputs.classList.add('hidden');
                containers.industrialInputs.classList.remove('hidden');
            }
            calculate();
        });
    });

    toggleBreakdownBtn.addEventListener('click', () => {
        breakdownContainer.classList.toggle('hidden');
        toggleBreakdownBtn.textContent = breakdownContainer.classList.contains('hidden')
            ? 'View Annual Breakdown'
            : 'Hide Annual Breakdown';
    });

    // Formatting Helpers
    const formatCurrency = (num) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    const formatCurrencyPrecise = (num) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    // Logic
    function handleEscalationModeChange(mode) {
        if (mode === 'manual') {
            containers.autoEscInputs.classList.add('hidden');
            inputs.rentInputs.forEach(input => input.disabled = false);
        } else {
            containers.autoEscInputs.classList.remove('hidden');
            inputs.rentInputs.forEach(input => input.disabled = true);

            if (mode === 'pct') {
                containers.pctInputGroup.classList.remove('hidden');
                containers.fixedInputGroup.classList.add('hidden');
            } else {
                containers.pctInputGroup.classList.add('hidden');
                containers.fixedInputGroup.classList.remove('hidden');
            }
            updateRentSchedule();
        }
    }

    function updateRentSchedule() {
        const mode = document.querySelector('input[name="escMethod"]:checked').value;
        if (mode === 'manual') return;

        const startRent = parseFloat(inputs.startBaseRent.value) || 0;
        let currentRent = startRent;

        inputs.rentInputs.forEach((input, index) => {
            if (index === 0) {
                input.value = startRent.toFixed(2);
            } else {
                if (mode === 'pct') {
                    const pct = (parseFloat(inputs.escPctValue.value) || 0) / 100;
                    currentRent *= (1 + pct);
                } else if (mode === 'fixed') {
                    const fixedAmt = parseFloat(inputs.escFixedValue.value) || 0;
                    currentRent += fixedAmt;
                }
                input.value = currentRent.toFixed(2);
            }
        });
        calculate();
    }

    function updateRentScheduleVisibility() {
        const termMonths = parseFloat(inputs.leaseTerm.value) || 0;
        const termYears = Math.ceil(termMonths / 12);

        // Select all year rows. Note: We need to select the parent .year-row, 
        // but inputs.rentInputs gives us the inputs. 
        // We can traverse up or select .year-row directly.
        const yearRows = document.querySelectorAll('.year-row');

        yearRows.forEach((row, index) => {
            if (index < termYears) {
                row.classList.remove('hidden');
            } else {
                row.classList.add('hidden');
            }
        });
    }

    // Calculation Logic
    function calculate() {
        updateRentScheduleVisibility();

        const termMonths = parseFloat(inputs.leaseTerm.value) || 0;
        const sqFt = parseFloat(inputs.squareFootage.value) || 0;
        const tmiPsf = parseFloat(inputs.tmiPsf.value) || 0;
        const freeRentMonths = parseFloat(inputs.freeRent.value) || 0;
        const isGrossFreeRent = inputs.freeRentType.value === 'gross';
        const tiPsf = parseFloat(inputs.tiAllowance.value) || 0;
        const landlordWorkPsf = parseFloat(inputs.landlordWork.value) || 0;
        const discountRateAnnual = (parseFloat(inputs.discountRate.value) || 0) / 100;
        const discountRateMonthly = discountRateAnnual / 12;

        // Get Rent Schedule
        const rentSchedule = Array.from(inputs.rentInputs).map(input => parseFloat(input.value) || 0);

        if (termMonths === 0 || sqFt === 0) return;

        let totalBaseRent = 0;
        let totalPV = 0;
        let monthlyData = [];

        // Calculate Monthly Cash Flows
        for (let month = 1; month <= termMonths; month++) {
            // Determine current year (1-based)
            const year = Math.ceil(month / 12);

            // Get rent for this year (handle index 0-19)
            // If term exceeds 20 years, use the last available year's rent
            const rentIndex = Math.min(year - 1, 19);
            const currentAnnualRate = rentSchedule[rentIndex];

            const monthlyBaseRent = (currentAnnualRate * sqFt) / 12;
            const monthlyTMI = (tmiPsf * sqFt) / 12;

            let actualRent = monthlyBaseRent;

            // Apply Free Rent
            if (month <= freeRentMonths) {
                if (isGrossFreeRent) {
                    // Gross Free Rent: Tenant pays nothing.
                    // Landlord loses Base Rent AND pays TMI out of pocket (or loses recovery).
                    // Net Effective Rent perspective: Landlord's cash flow is -TMI.
                    actualRent = -monthlyTMI;
                } else {
                    // Net Free Rent: Tenant pays TMI, but no Base Rent.
                    // Landlord receives 0 Base Rent. TMI is a wash (pass-through).
                    actualRent = 0;
                }
            }

            totalBaseRent += actualRent;

            // Calculate PV for this month (Beginning of Period)
            // Formula: CashFlow / (1 + r)^(n-1)
            const pvFactor = Math.pow(1 + discountRateMonthly, month - 1);
            const monthlyPV = actualRent / pvFactor;
            totalPV += monthlyPV;

            monthlyData.push({
                month,
                year,
                baseRentPsf: currentAnnualRate,
                monthlyRent: actualRent,
                fullRent: monthlyBaseRent
            });
        }

        // Calculate Commissions
        let totalCommissions = 0;
        const isOffice = document.getElementById('modelOffice').checked;

        if (isOffice) {
            // Office: $/SF/Year * Years
            const listingFeePsfPerYear = parseFloat(inputs.listingFee.value) || 0;
            const tenantRepFeePsfPerYear = parseFloat(inputs.tenantRepFee.value) || 0;
            const termYears = termMonths / 12;
            totalCommissions = (listingFeePsfPerYear + tenantRepFeePsfPerYear) * termYears * sqFt;
        } else {
            // Industrial: Split % of Gross Rent
            const listingFeeYr1 = (parseFloat(inputs.listingFeeIndYr1.value) || 0) / 100;
            const listingFeeYr2 = (parseFloat(inputs.listingFeeIndYr2.value) || 0) / 100;
            const tenantRepFeeYr1 = (parseFloat(inputs.tenantRepFeeIndYr1.value) || 0) / 100;
            const tenantRepFeeYr2 = (parseFloat(inputs.tenantRepFeeIndYr2.value) || 0) / 100;

            // Iterate through monthly data to apply correct %
            // Note: Usually commissions are based on the *scheduled* base rent, not collected (ignoring free rent).
            // We will use 'fullRent' from monthlyData which is the scheduled rent.

            monthlyData.forEach(m => {
                const isYear1 = m.month <= 12;
                const listingRate = isYear1 ? listingFeeYr1 : listingFeeYr2;
                const tenantRepRate = isYear1 ? tenantRepFeeYr1 : tenantRepFeeYr2;

                const monthlyCommission = m.fullRent * (listingRate + tenantRepRate);
                totalCommissions += monthlyCommission;
            });
        }

        // Calculate Concessions & Costs
        const totalTI = tiPsf * sqFt;
        const totalLandlordWork = landlordWorkPsf * sqFt;

        // Calculate value of free rent for display
        const totalFreeRentValue = monthlyData
            .filter(m => m.month <= freeRentMonths)
            .reduce((sum, m) => {
                // Value to tenant / Cost to landlord
                if (isGrossFreeRent) {
                    return sum + m.fullRent + ((tmiPsf * sqFt) / 12);
                } else {
                    return sum + m.fullRent;
                }
            }, 0);

        // Total Concessions (Tenant Incentives: TI + Landlord Work + Free Rent)
        // Commissions are transaction costs, not concessions to the tenant.
        const totalConcessions = totalTI + totalLandlordWork + totalFreeRentValue;

        // Tenant Incentives (for % calculation)
        const totalTenantIncentives = totalConcessions;

        // Year 1 Gross Rent
        // (Base Rent Year 1 + TMI) * SqFt
        const baseRentYr1 = rentSchedule[0] || 0;
        const year1GrossRent = (baseRentYr1 + tmiPsf) * sqFt;

        // Incentives % of Year 1 Gross
        let incentivesPct = 0;
        if (year1GrossRent > 0) {
            incentivesPct = (totalTenantIncentives / year1GrossRent) * 100;
        }

        // Payback Period Calculation
        // Time to recover (TI + Landlord Work + Commissions) using Net Cash Flow.
        // Net Cash Flow = Rent Collected.
        // Note: If Gross Free Rent, cash flow is negative (-TMI) during free rent.
        let cumulativeCashFlow = -(totalTI + totalLandlordWork + totalCommissions);
        let paybackMonth = 0;
        let recovered = false;

        // We need to simulate beyond the lease term if payback > term? 
        // Usually payback is within term. If not, we cap at term or indicate > term.
        // Let's iterate through the monthlyData we already have.

        for (let i = 0; i < monthlyData.length; i++) {
            const m = monthlyData[i];
            // m.monthlyRent is the actual base rent collected (0 or negative TMI if gross free rent)
            // Wait, m.monthlyRent logic in the loop above:
            // If Gross Free Rent: actualRent = -monthlyTMI
            // If Net Free Rent: actualRent = 0
            // Normal: actualRent = monthlyBaseRent

            // This 'actualRent' represents the Net Cash Flow to the landlord relative to the base building shell
            // (assuming TMI is a wash/pass-through).
            // So we just add this to the cumulative balance.

            cumulativeCashFlow += m.monthlyRent;

            if (!recovered && cumulativeCashFlow >= 0) {
                paybackMonth = m.month;
                recovered = true;
                break;
            }
        }

        // NPV Calculation
        // NPV = PV of Rents (which includes negative TMI flows if Gross) - TI - Landlord Work - Commissions
        const npv = totalPV - totalTI - totalLandlordWork - totalCommissions;

        // Net Effective Rent Calculation (PV Based / Level Equivalent)
        // NER = Amortized value of the NPV over the lease term
        // We need the PV of an annuity of $1/month paid in advance (BoP) for the term
        // Formula for Annuity Due: PV = PMT * [ (1 - (1+r)^-n) / r ] * (1+r)
        // But we can just sum it up to be safe and clear.

        let pvAnnuityFactor = 0;
        if (discountRateMonthly === 0) {
            pvAnnuityFactor = termMonths;
        } else {
            for (let i = 0; i < termMonths; i++) {
                // Discounting payment at month i (0-indexed for discounting)
                // Month 1 payment is at time 0.
                pvAnnuityFactor += 1 / Math.pow(1 + discountRateMonthly, i);
            }
        }

        // NER (Monthly per SF) = (NPV / SqFt) / AnnuityFactor
        // This gives the level monthly payment that results in the same NPV.
        let ner = 0;
        if (pvAnnuityFactor !== 0) {
            const nerMonthlyPsf = (npv / sqFt) / pvAnnuityFactor;
            ner = nerMonthlyPsf * 12;
        }

        // Update Outputs
        outputs.nerValue.textContent = formatCurrencyPrecise(ner);
        outputs.npvValue.textContent = formatCurrency(npv);

        // Total Lease Value (Sum of all base rent payments)
        const grossRent = monthlyData.reduce((sum, m) => sum + (m.monthlyRent > 0 ? m.monthlyRent : 0), 0);
        outputs.totalValue.textContent = formatCurrency(grossRent);

        outputs.avgMonthly.textContent = formatCurrency(grossRent / termMonths);
        outputs.totalConcessions.textContent = formatCurrency(totalConcessions);

        outputs.incentivesPct.textContent = incentivesPct.toFixed(1) + '%';
        outputs.paybackMonths.textContent = recovered ? paybackMonth : `>${termMonths}`;

        updateTable(monthlyData, sqFt);
        updateChart(monthlyData);
    }

    function updateTable(monthlyData, sqFt) {
        outputs.breakdownTableBody.innerHTML = '';

        // Group by Year
        const years = {};
        monthlyData.forEach(m => {
            if (!years[m.year]) {
                years[m.year] = {
                    baseRentPsf: m.baseRentPsf,
                    totalRent: 0,
                    freeMonths: 0
                };
            }
            years[m.year].totalRent += m.monthlyRent;
            if (m.monthlyRent === 0) years[m.year].freeMonths++;
        });

        Object.keys(years).forEach(year => {
            const y = years[year];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>Year ${year}</td>
                <td>${formatCurrencyPrecise(y.baseRentPsf)}</td>
                <td>${formatCurrency(y.totalRent)}</td>
                <td>${y.freeMonths > 0 ? y.freeMonths + ' mos' : '-'}</td>
                <td>${formatCurrencyPrecise(y.totalRent / sqFt)} / sf</td>
            `;
            outputs.breakdownTableBody.appendChild(row);
        });
    }

    function updateChart(monthlyData) {
        const ctx = document.getElementById('cashFlowChart').getContext('2d');

        // Aggregate by Year for cleaner chart
        const years = {};
        monthlyData.forEach(m => {
            if (!years[m.year]) years[m.year] = 0;
            years[m.year] += m.monthlyRent;
        });

        const labels = Object.keys(years).map(y => `Year ${y}`);
        const data = Object.values(years);

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Net Annual Cash Flow',
                    data: data,
                    backgroundColor: 'rgba(56, 189, 248, 0.6)',
                    borderColor: 'rgba(56, 189, 248, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8',
                            callback: function (value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                }
            }
        });
    }

    // Initial Calculation
    calculate();
});
