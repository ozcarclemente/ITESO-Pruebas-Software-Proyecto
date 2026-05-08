Feature: Autenticación y Gestión de Cuenta
Como usuario de la aplicación
Quiero poder registrarme, iniciar sesión y gestionar mi cuenta
Para poder interactuar con la plataforma de forma segura

Scenario: Registro de un nuevo usuario exitoso
  Given que estoy en la página de registro
  When ingreso un nombre de usuario "nuevoUsuarioTest"
  And ingreso el correo "nuevousuario@test.com"
  And ingreso la contraseña "Password123!"
  And hago clic en el botón de registro
  Then debo ser redirigido al inicio
  And debo ver mi nombre de usuario en la navegación

Scenario: Inicio de sesión con credenciales inválidas
  Given que estoy en la página de inicio de sesión
  When ingreso el correo "example1@mail.com"
  And ingreso una contraseña incorrecta "claveEquivocada"
  And hago clic en el botón de iniciar sesión
  Then debo ver un mensaje de error indicando credenciales inválidas

Scenario: Inicio de sesión exitoso con usuario existente
  Given que estoy en la página de inicio de sesión
  When ingreso el correo "example1@mail.com"
  And ingreso la contraseña correcta "examplePwd1"
  And hago clic en el botón de iniciar sesión
  Then debo ser redirigido al inicio
  And debo ver mi nombre de usuario en la navegación

Scenario: Actualización de datos en la configuración
Given que he iniciado sesión con el usuario "nuevousuario@test.com" y la contraseña "Password123!"
And me encuentro en la página de configuración
When actualizo mi biografía con "Esta es mi nueva biografía de prueba"
And hago clic en el botón de actualizar configuración
Then debo ver los cambios reflejados o ser redirigido a mi perfil