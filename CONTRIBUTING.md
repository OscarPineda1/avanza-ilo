# 🛠️ Guía de contribución

Este documento resume las convenciones que debe seguir el equipo al contribuir dentro de la prueba de concepto.

---

## 📌 Convención de commits

Usamos **Conventional Commits**, lo que significa que cada mensaje de commit debe empezar con un tipo que indique qué tipo de cambio se hace.

| Tipo       | Uso cuando…                                                 | Ejemplo                                                             |
| ---------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| `feat`     | agregas una nueva funcionalidad                             | `feat: Se agregó el módulo de reportes de ventas`                   |
| `fix`      | corriges un bug                                             | `fix: Se corrigió error en la validación de correos en el registro` |
| `style`    | solo hay cambios de formato (indentación, nombres, etc.)    | `style: Se ajustó la indentación en el componente de login`         |
| `refactor` | refactorizas código sin agregar una nueva funcionalidad     | `refactor: Se simplificó la lógica de cálculo de descuentos`        |
| `docs`     | modificas o agregas documentación                           | `docs: Se actualizó la guía de instalación en el README`            |
| `test`     | agregas o modificas pruebas                                 | `test: Se añadieron pruebas unitarias para el servicio de pagos`    |
| `chore`    | tareas de apoyo (scripts, configuraciones, pipelines, etc.) | `chore: Se actualizó la configuración de Docker Compose`            |