import type { BaseFilter, Where } from 'payload'

// URL parameter of the employee list that shows former employees too (FormerEmployeesToggle).
export const SHOW_FORMER_PARAM = 'former'

// People who still work here, like the website shows them: neither archived nor past their exit
// date. The day pickers store noon UTC, so an exit date of today is still after midnight UTC.
export const currentEmployees = (): Where => {
  const today = `${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`
  return {
    and: [
      { or: [{ archived: { equals: false } }, { archived: { exists: false } }] },
      { or: [{ exitDate: { exists: false } }, { exitDate: { greater_than_equal: today } }] },
    ],
  }
}

// The employee list leaves out former employees unless the toggle asks for them.
export const employeeListFilter: BaseFilter = ({ req }) =>
  req.query?.[SHOW_FORMER_PARAM] === '1' ? null : currentEmployees()
