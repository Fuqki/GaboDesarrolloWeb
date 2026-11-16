import { parseOperatorAssignments, getOperatorsSummary, getOperatorForOperation } from './operators';
test('distribuye nombres antiguos entre operaciones y elimina duplicados del resumen', () => {
  expect(parseOperatorAssignments('Ana, Luis', 3)).toEqual({ 1: 'Ana', 2: 'Luis', 3: 'Ana' });
  expect(getOperatorsSummary('Ana, Luis', 3)).toBe('Ana, Luis');
});
test('respeta asignaciones JSON y operaciones sin responsable', () => {
  expect(getOperatorForOperation('[{"num_operacion":2,"nombre":"Ana"}]', 3, 2)).toBe('Ana');
  expect(getOperatorForOperation('', 3, 1)).toBe('Sin asignar');
});
