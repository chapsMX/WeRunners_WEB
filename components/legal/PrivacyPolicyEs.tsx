// Aviso de privacidad — español (MX). Mantener alineado con PrivacyPolicyEn.tsx.
const CONTACT = "run@w3runn3rs.com"

export function PrivacyPolicyEs() {
  return (
    <>
      <h1>Política de privacidad</h1>
      <p className="text-slate-400 text-sm">Última actualización: 19 de noviembre de 2026 | Ciudad de México, México</p>

      <p>
        Este aviso de privacidad explica qué datos personales recaba We Runners, para qué los usamos, qué pueden ver otras
        personas y cómo puedes controlarlos. Aplica a nuestro sitio (<strong>www.w3runn3rs.com</strong>) y a nuestra app (
        <strong>app.w3runn3rs.com</strong>), a los que llamamos en conjunto el &ldquo;Servicio&rdquo;.
      </p>

      <h2>1. Quiénes somos</h2>
      <p>
        We Runners (&ldquo;nosotros&rdquo;) es un hub global para clubes de corredores, con domicilio en la Ciudad de
        México, México. Somos responsables de los datos personales que se describen en este aviso. Para cualquier tema
        relacionado con tus datos, escríbenos a <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
      </p>

      <h2>2. Datos que recabamos</h2>
      <h3>Tu cuenta</h3>
      <ul>
        <li>Nombre y correo electrónico.</li>
        <li>
          Si te registras con correo y contraseña, tu contraseña se guarda solo como un hash seguro. Si entras con
          Google, Google comparte con nosotros tu nombre, correo y foto de perfil.
        </li>
      </ul>

      <h3>Tu perfil</h3>
      <ul>
        <li>Nombre de usuario, foto de perfil, imagen de portada y bio.</li>
        <li>Ligas a tus perfiles en redes (X, Instagram, Facebook, Strava), si las agregas.</li>
        <li>Unidad preferida (km o millas), idioma y zona horaria.</li>
        <li>Los corredores que sigues y quién te sigue.</li>
      </ul>

      <h3>Tu club</h3>
      <ul>
        <li>El club al que perteneces, la fecha en que te uniste y tu rol (miembro, colaborador o dueño).</li>
        <li>Solicitudes para unirte a un club y los datos de cualquier club que nos pidas agregar (nombre, ciudad, país, correo de contacto, sitio web, logo).</li>
      </ul>

      <h3>Corridas de tu dispositivo conectado (Garmin, Polar)</h3>
      <p>
        Solo si conectas tu cuenta con un proveedor de dispositivos, y solo con tu autorización en ese proveedor. De cada
        corrida recibimos:
      </p>
      <ul>
        <li>Fecha, hora de inicio y zona horaria, distancia, duración, ritmo y tipo de actividad (calle, trail, caminadora, etc.).</li>
        <li>Nombre del dispositivo y los indicadores del proveedor, por ejemplo si la corrida se capturó a mano o se subió desde la web.</li>
        <li>Cuando el proveedor los envía: desnivel, frecuencia cardiaca promedio y máxima, cadencia y calorías.</li>
        <li>Cuando el proveedor lo envía: el punto de inicio de la corrida (latitud y longitud).</li>
        <li>
          Cuando el proveedor envía muestras detalladas (por ejemplo, los puntos GPS registrados durante la corrida), las
          usamos solo para funciones del Servicio, como una forma simplificada de la ruta. Nunca mostramos tus
          coordenadas a otras personas.
        </li>
      </ul>
      <p>
        Guardamos el resumen de la corrida tal como lo envió el proveedor, para poder revisar y corregir cómo se contó
        cada corrida. También guardamos, cifradas, las credenciales de acceso necesarias para recibir tus corridas. Los
        proveedores solo envían corridas registradas después de que te conectas; no recibimos tu historial.
      </p>

      <h3>Formularios del sitio</h3>
      <ul>
        <li>Lista de espera: correo, nombre y, si quieres, tu club.</li>
        <li>Solicitudes de embajadores: nombre, correo, usuarios de redes sociales y país.</li>
      </ul>

      <h3>Datos de uso</h3>
      <ul>
        <li>
          Usamos <strong>Google Analytics 4</strong> en el sitio y en la app para entender cómo se usa el Servicio
          (páginas visitadas, tipo de dispositivo, ubicación aproximada por país o ciudad, y eventos como el registro).
        </li>
        <li>Nuestro proveedor de hosting guarda registros técnicos (como dirección IP y navegador) por seguridad y para resolver fallas.</li>
      </ul>

      <h2>3. Para qué usamos tus datos</h2>
      <ul>
        <li>Para operar el Servicio: tu cuenta, tu perfil, tu membresía en un club y tu dashboard.</li>
        <li>Para sumar los kilómetros de tus corridas a tu club y armar los leaderboards de clubes y global.</li>
        <li>
          Para que los leaderboards sean justos: excluimos automáticamente las corridas capturadas a mano o subidas desde
          la web, las anteriores a tu ingreso al club, los duplicados de una misma corrida y las corridas con un ritmo que
          ningún corredor podría sostener.
        </li>
        <li>Para mostrarte tus propias estadísticas y récords.</li>
        <li>
          Para enviarte correos sobre el Servicio: verificación de correo, bienvenida, acceso a la beta y avisos sobre
          solicitudes y aprobaciones de clubes.
        </li>
        <li>Para proteger el Servicio y a quienes lo usan, y para cumplir con la ley.</li>
        <li>Para mejorar el Servicio, con información agregada.</li>
      </ul>
      <p>
        <strong>No vendemos tus datos personales, no mostramos anuncios y no usamos tus datos de actividad con fines
        publicitarios.</strong>
      </p>

      <h2>4. Qué pueden ver otras personas</h2>
      <p>We Runners gira alrededor de los clubes, así que parte de la información es pública, incluso para personas sin cuenta:</p>
      <ul>
        <li>
          <strong>Tu perfil</strong> (app.w3runn3rs.com/u/tu-usuario): nombre, usuario, foto, bio, redes, tu club, número
          de seguidores, tu posición y kilómetros del mes en tu club, y tus récords personales.
        </li>
        <li>
          <strong>La página de tu club</strong>: nombres y fotos de sus integrantes, las corridas que contaron para el club
          este mes (corredor, distancia y fecha) y el leaderboard del club.
        </li>
        <li>
          <strong>Los leaderboards</strong>: kilómetros totales, corridas y número de corredores de cada club.
        </li>
      </ul>
      <p>
        Frecuencia cardiaca, cadencia, calorías, punto de inicio y puntos GPS son <strong>solo para ti</strong>: nunca se
        muestran a otras personas. Cuando usas un botón para compartir, tú eliges qué publicar y dónde.
      </p>

      <h2>5. Garmin, Polar y otros proveedores de dispositivos</h2>
      <ul>
        <li>Conectas un proveedor entrando con tu cuenta y aceptando los permisos que te muestra. Puedes cambiar esos permisos en la app del proveedor.</li>
        <li>
          Puedes desconectarte cuando quieras desde tu configuración en We Runners o desde la app del proveedor. Al
          desconectarte, borramos tus credenciales de acceso y dejamos de recibir corridas. Las corridas que ya
          recibimos se quedan en tu cuenta y siguen contando para el club en el que contaron, a menos que nos pidas
          borrarlas (ver sección 8).
        </li>
        <li>Usamos los datos de estos proveedores solo para operar el Servicio, nunca para venderlos ni con fines publicitarios.</li>
        <li>Cada proveedor trata tus datos dentro de su propio servicio, conforme a su propia política de privacidad.</li>
      </ul>

      <h2>6. Quién trata tus datos por nosotros</h2>
      <p>Compartimos datos personales solo con proveedores que nos ayudan a operar el Servicio, y solo lo necesario:</p>
      <ul>
        <li><strong>Vercel</strong>: hosting y almacenamiento de las imágenes que subes (fotos, portadas, logos).</li>
        <li><strong>Neon</strong>: nuestra base de datos.</li>
        <li><strong>Resend</strong>: envío de correos.</li>
        <li><strong>Google</strong>: inicio de sesión con Google y Google Analytics.</li>
        <li><strong>Garmin y Polar</strong>: el origen de tus corridas, cuando los conectas.</li>
      </ul>
      <p>
        Estos proveedores pueden tratar datos en Estados Unidos y otros países. También podemos revelar información
        cuando la ley lo exija.
      </p>

      <h2>7. Cookies</h2>
      <ul>
        <li>
          <strong>Esenciales</strong>: tu sesión (para mantenerte dentro), tu idioma, si ya estás en la lista de espera y
          el link de invitación de un club que abriste (30 días, para que el club correcto ya esté listo al registrarte).
        </li>
        <li>
          <strong>Analítica</strong>: cookies de Google Analytics. Puedes desactivarlas con el{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
            complemento de inhabilitación de Google
          </a>
          .
        </li>
      </ul>

      <h2>8. Cuánto tiempo guardamos tus datos y cómo borrarlos</h2>
      <ul>
        <li>Datos de cuenta, perfil, club y corridas: mientras tu cuenta esté activa.</li>
        <li>Datos de la lista de espera: hasta que nos pidas quitarlos.</li>
        <li>Registros técnicos: por un periodo corto, por seguridad y para resolver fallas.</li>
      </ul>
      <p>
        Para borrar tu cuenta y tus datos, escríbenos a <a href={`mailto:${CONTACT}`}>{CONTACT}</a> desde el correo de tu
        cuenta. Borramos tu cuenta, perfil, corridas y credenciales de dispositivos en un máximo de 30 días, salvo la
        información que la ley nos obligue a conservar.
      </p>

      <h2>9. Tus derechos</h2>
      <p>
        Puedes acceder a tus datos personales, corregirlos, cancelarlos u oponerte a su uso (tus derechos ARCO). Si estás
        en la Unión Europea o en el Reino Unido, también puedes pedir una copia de tus datos en un formato portable, pedir
        que limitemos su uso y presentar una queja ante tu autoridad de protección de datos. Para ejercer cualquiera de
        estos derechos, escríbenos a <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. Respondemos en un máximo de 20 días
        hábiles.
      </p>
      <p>Puedes retirar tu consentimiento para recibir corridas en cualquier momento desconectando tu dispositivo.</p>

      <h2>10. Seguridad</h2>
      <p>
        Usamos conexiones cifradas (HTTPS), ciframos las credenciales de acceso de los dispositivos y limitamos quién
        puede acceder a los datos personales. Ningún sistema es completamente seguro, pero trabajamos para proteger tus
        datos y te avisaremos si un incidente de seguridad los afecta.
      </p>

      <h2>11. Edad mínima</h2>
      <p>
        El Servicio es para personas de al menos <strong>18 años</strong>. No recabamos a sabiendas datos personales de
        menores de edad. Si crees que un menor creó una cuenta, escríbenos y la borraremos.
      </p>

      <h2>12. Cambios a este aviso</h2>
      <p>
        Podemos actualizar este aviso conforme cambie el Servicio. Publicaremos la nueva versión en esta página con su
        fecha y, si los cambios son importantes, te avisaremos por correo o en la app.
      </p>
    </>
  )
}
