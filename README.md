# Squirrel Doc Web

Aplicación web estática para herramientas de archivos, con procesamiento en el navegador.

## Funciones
- Selección múltiple y arrastrar/soltar.
- Conversión de imágenes compatibles a PNG.
- Información básica de archivos y exportación de listado CSV.
- Hash SHA-256.
- Herramientas PDF locales: organizar páginas, extraer páginas y exportar páginas como imágenes (en desarrollo progresivo).
- Creación y extracción de archivos ZIP en el navegador.

## Privacidad y límites
Los archivos seleccionados se procesan en el navegador y no se envían a un servidor de Squirrel Doc. Para habilitar algunas herramientas se cargan bibliotecas JavaScript de terceros desde CDN cuando se necesita la función; el navegador necesita conexión para descargarlas la primera vez. Si necesitas operar totalmente sin conexión, habría que empaquetar esas bibliotecas dentro del repositorio y probar GitHub Pages/PWA por separado.

El navegador no puede acceder libremente a todas las rutas del disco ni sobrescribir archivos sin una acción explícita del usuario. Las descargas se realizan mediante el diálogo normal del navegador.

## Publicar
Activa GitHub Pages desde **Settings → Pages → Deploy from a branch → main → /(root)**.

## Estado
Prototipo en crecimiento. Las funciones deben validarse en Chrome/Edge y con archivos reales. La disponibilidad y fidelidad de la conversión dependen del formato, navegador y bibliotecas usadas.
