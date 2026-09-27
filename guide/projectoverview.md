# Project Overview — Educational Management Portal (EMP)

## Vision & Architecture Strategy
The Educational Management Portal (EMP) is a white-label, commercial-grade management SaaS designed to support educational institutions (Schools, Academies, Institutes). 

The entire system relies on a **Config-First Architecture**, where all branding, nomenclature, color themes, currency symbols, and dynamic flags are driven by a single source of truth: `institution.config.ts`.

---

## Core Technical Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context / Custom Mock Store
- **Execution Agent**: Kilo Code (Qwen 3.8 Flash)

---

## Key Business Logic & Financial Model
The portal calculates institution financial health using a central cashflow ledger:

$$\text{Net Cashflow} = \text{Total Fees Collected} - (\text{Total Payroll Paid} + \text{Total Custom Expenses})$$

- **Fees Collected**: Tuition vouchers paid by students.
- **Payroll Paid**: Salary disbursements paid to faculty/staff.
- **Expenses**: Operational expenses logged by admins (Rent, Utilities, Supplies).

---

## Role Matrix & Access Levels
1. **Super Admin**: Complete financial visibility, central ledger, settings, full system access.
2. **Admin**: Day-to-day operations, student/teacher enrollment, attendance marking, voucher generation.
3. **Teacher**: View schedule, assigned classes, payslips, mark student attendance.
4. **Student**: View personal attendance %, outstanding vouchers (downloadable), enrolled courses.