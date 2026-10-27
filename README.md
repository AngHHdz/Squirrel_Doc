# Squirrel Doc Web

Aplicación web estática para herramientas de archivos. Los archivos seleccionados se procesan en el navegador; no se envían a un backend de Squirrel Doc.

## Funciones disponibles en el prototipo
- Selección múltiple y arrastrar/soltar archivos.
- Conversión de imágenes compatibles a PNG.
- Compresión de imágenes a JPEG con control de calidad.
- Redimensionado de imágenes con límites de ancho y alto.
- Exportación de listado a CSV.
- Exportación de metadatos básicos a TXT.
- Cálculo de hashes SHA-256.
- Unir varios PDF.
- Extraer un rango/lista de páginas de un PDF a un PDF nuevo.
- Girar una página de un PDF.
- Crear ZIP con archivos seleccionados.
- Extraer archivos de ZIP como descargas separadas.

## Dependencias externas
Las funciones PDF cargan PDF-lib 1.17.1 desde cdnjs bajo demanda. Las funciones ZIP cargan JSZip 3.10.1 desde cdnjs bajo demanda. La primera utilización de estas funciones requiere conectividad para descargar las bibliotecas. Los archivos del usuario se procesan en el navegador y no se suben a esos servicios. Para uso sin conexión, las bibliotecas deberán empaquetarse localmente y añadirse verificaciones de integridad.

## Privacidad y límites
- No hay servidor ni backend.
- No se guardan archivos del usuario en Squirrel Doc.
- El navegador controla las descargas y no permite acceso arbitrario a rutas locales.
- La compatibilidad depende del navegador y del formato. Las conversiones de imagen usan APIs nativas del navegador.
- PDF-lib no sustituye a un motor OCR y no garantiza una compresión PDF significativa. OCR, Office, audio/vídeo y conversión masiva avanzada todavía no están implementados.

## Publicar
Activa GitHub Pages desde **Settings → Pages → Deploy from a branch → main → /(root)**.

## Pruebas recomendadas
Probar en versiones actuales de Chrome y Edge con imágenes transparentes, imágenes grandes, PDF protegido/normal, PDF multipágina y ZIP con carpetas. Revisar las herramientas del navegador para confirmar que no se producen solicitudes con contenido de archivos.
