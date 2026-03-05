export function parseOperatorAssignments(rawOperators, numOperations = 0) {
  const fallback = {};
  if (!rawOperators) return fallback;

  try {
    const parsed = JSON.parse(rawOperators);
    const map = {};

    if (Array.isArray(parsed)) {
      parsed.forEach((item, index) => {
        if (typeof item === 'string') {
          map[index + 1] = item.trim();
          return;
        }

        if (item && typeof item === 'object') {
          const op =
            Number(item.numOperacion) ||
            Number(item.num_operacion) ||
            Number(item.operacion) ||
            index + 1;
          const name = String(
            item.operador || item.nombre || item.name || ''
          ).trim();
          if (op > 0 && name) {
            map[op] = name;
          }
        }
      });
    }

    return map;
  } catch {
    const names = String(rawOperators)
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);

    if (names.length === 0) return fallback;

    const totalOps = Math.max(Number(numOperations) || names.length, 1);
    const map = {};
    for (let op = 1; op <= totalOps; op += 1) {
      map[op] = names[(op - 1) % names.length];
    }
    return map;
  }
}

export function getOperatorForOperation(rawOperators, numOperations, operationNumber) {
  const map = parseOperatorAssignments(rawOperators, numOperations);
  return map[operationNumber] || 'Sin asignar';
}

export function getOperatorsSummary(rawOperators, numOperations) {
  const map = parseOperatorAssignments(rawOperators, numOperations);
  const unique = [...new Set(Object.values(map).filter(Boolean))];
  return unique.length > 0 ? unique.join(', ') : 'Sin asignar';
}
