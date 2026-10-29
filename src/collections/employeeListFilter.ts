import type { BaseFilter } from 'payload'

// URL parameter of the employee list that shows former employees too (FormerEmployeesToggle).
export const SHOW_FORMER_PARAM = 'former'

// The employee list leaves out former employees, like the website does: archived ones and those
// whose exit date has passed. The day pickers store noon UTC, so an exit date of today is still
// after midnight UTC.
export const employeeListFilter: BaseFilter = ({ req }) => {
  if (req.query?.[SHOW_FORMER_PARAM] === '1') return null
  const today = `${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`
  return {
    and: [
      { or: [{ archived: { equals: false } }, { archived: { exists: false } }] },
      { or: [{ exitDate: { exists: false } }, { exitDate: { greater_than_equal: today } }] },
    ],
  }
}
