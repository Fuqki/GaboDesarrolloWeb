import React, { useMemo, useState } from 'react';

const FAQ_ITEMS = [
  {
    id: 'acceso',
    category: 'Acceso al sistema',
    question: '¿Cómo inicio sesión?',
    answer:
      'Ingresa tu número de empleado (solo dígitos) y tu contraseña asignada por el departamento de Calidad. Si olvidaste la contraseña, contacta al administrador del sistema.',
  },
  {
    id: 'admin',
    category: 'Administración',
    question: '¿Quién puede gestionar usuarios?',
    answer:
      'Solo los usuarios con rol Administrador ven los enlaces de administración en la barra lateral y el encabezado. Desde «Usuarios» pueden registrar empleados y restablecer contraseñas. El usuario administrador inicial suele ser el número de empleado 9999 (consulta a tu responsable la contraseña inicial).',
  },
  {
    id: 'no-acceso',
    category: 'Acceso al sistema',
    question: 'Olvidé mi contraseña o no puedo entrar. ¿Qué hago?',
    answer:
      'En la pantalla de inicio de sesión usa el botón «¿No puedes entrar? Notificar al administrador». Indica tu número de empleado y, si quieres, un mensaje. Se generará una solicitud que verán los administradores en «Solicitudes de acceso» para restablecer tu contraseña.',
  },
  {
    id: 'dashboard',
    category: 'Panel principal',
    question: '¿Qué muestra el panel de revisiones?',
    answer:
      'Lista todas las revisiones de pieza registradas. Puedes ordenar por fecha de revisión, fecha de salida, número de pieza o fábrica. El indicador de inspección muestra si ya existe hoja de calidad (aprobada, rechazada o pendiente).',
  },
  {
    id: 'nueva-revision',
    category: 'Revisiones',
    question: '¿Cómo registro una nueva revisión?',
    answer:
      'En el panel principal pulsa «+ Nueva Revisión». Completa número de pieza, identificador de plano, fábrica, número de operaciones, fechas y, si aplica, sube el archivo del plano (PDF o imagen). Asigna un operador por cada operación. Al guardar, la revisión queda en la base de datos.',
  },
  {
    id: 'operadores',
    category: 'Revisiones',
    question: '¿Por qué hay un campo de operador por operación?',
    answer:
      'Así se registra con precisión quién realizó cada operación. En la tabla principal puedes elegir el número de operación en el desplegable y ver el operador correspondiente.',
  },
  {
    id: 'detalle',
    category: 'Detalle de pieza',
    question: '¿Qué incluye el detalle de una pieza?',
    answer:
      'Tres pestañas: Información general (datos de la pieza y fechas), Plano (archivo subido o solo el identificador de texto) e Inspección de calidad (hoja completada o botón para llenarla).',
  },
  {
    id: 'inspeccion',
    category: 'Inspección de calidad',
    question: '¿Cómo lleno la hoja de inspección?',
    answer:
      'Abre el detalle de la pieza, ve a la pestaña «Inspección de calidad» y pulsa «Llenar Hoja de Inspección». Completa medida nominal, tolerancia, medida real y marca si cada operación está aprobada. Puedes añadir observaciones generales. El inspector se toma de tu sesión actual.',
  },
  {
    id: 'clientes',
    category: 'Vista por cliente',
    question: '¿Para qué sirve la barra lateral de clientes?',
    answer:
      'Filtra las revisiones por fábrica/cliente (Amphenol, Magnetics, Ichor, etc.). Verás solo las piezas asociadas a ese cliente.',
  },
  {
    id: 'busqueda',
    category: 'Búsqueda',
    question: '¿Cómo funciona el buscador del encabezado?',
    answer:
      'Permite buscar por número de pieza. Si no obtienes resultados, verifica la escritura o que la pieza exista en el sistema.',
  },
  {
    id: 'backend',
    category: 'Técnico',
    question: '¿Necesito tener el servidor encendido?',
    answer:
      'Sí. El sistema usa un backend (API) y una base de datos. Si no puedes iniciar sesión o no cargan datos, confirma que el servicio del servidor esté en ejecución y que la URL del API sea la correcta en tu entorno.',
  },
];

function FAQ() {
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState('');

  const filteredItems = useMemo(() => {
    if (!filter.trim()) return FAQ_ITEMS;
    const q = filter.trim().toLowerCase();
    return FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [filter]);

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="faq-page">
      <div className="faq-header">
        <h1>Centro de ayuda</h1>
        <p className="faq-intro">
          Preguntas frecuentes sobre el uso del sistema de inspección de calidad MaquinadosRBS.
        </p>
        <div className="faq-search">
          <label htmlFor="faq-filter" className="visually-hidden">
            Buscar en el FAQ
          </label>
          <input
            id="faq-filter"
            type="search"
            placeholder="Buscar por palabra clave…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="faq-search-input"
          />
        </div>
      </div>

      <div className="faq-list" role="list">
        {filteredItems.length === 0 ? (
          <p className="faq-empty">No hay resultados para tu búsqueda.</p>
        ) : (
          filteredItems.map((item) => {
            const expanded = openId === item.id;
            return (
              <article key={item.id} className="faq-item" role="listitem">
                <button
                  type="button"
                  className={`faq-question ${expanded ? 'is-open' : ''}`}
                  onClick={() => toggle(item.id)}
                  aria-expanded={expanded}
                  aria-controls={`faq-panel-${item.id}`}
                  id={`faq-trigger-${item.id}`}
                >
                  <span className="faq-category-tag">{item.category}</span>
                  <span className="faq-question-text">{item.question}</span>
                  <span className="faq-chevron" aria-hidden>
                    {expanded ? '−' : '+'}
                  </span>
                </button>
                <div
                  id={`faq-panel-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${item.id}`}
                  className={`faq-answer ${expanded ? 'is-open' : ''}`}
                  aria-hidden={!expanded}
                >
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

export default FAQ;
