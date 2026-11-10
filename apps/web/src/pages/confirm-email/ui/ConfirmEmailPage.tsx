import { useConfirmEmail } from '../../../features/confirm-email/model/useConfirmEmail';

export default function ConfirmEmailPage() {
  const {
    status,
    error,
    isBlocked,
    isRecovery,
    recoveryVerified,
    password,
    setPassword,
    passwordConfirmation,
    setPasswordConfirmation,
    verifyRecoveryLink,
    updatePassword,
    confirmEmail,
  } = useConfirmEmail();
  const isSuccess = status === 'success';
  const isLoading = status === 'loading';
  const visibleMessage = status === 'error' ? error : '';
  const statusKind = isSuccess ? 'success' : visibleMessage ? 'error' : 'info';
  const title = isRecovery
    ? isSuccess
      ? '¡Contraseña actualizada!'
      : 'Restablece tu contraseña'
    : isSuccess
      ? '¡Correo confirmado!'
      : 'Confirma tu correo';

  return (
    <main className="page">
      <div className="ambient ambient-left" aria-hidden="true" />
      <div className="ambient ambient-right" aria-hidden="true" />

      <section className="confirm-card" aria-labelledby="title">
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M8 19.5 24 10l16 9.5v17a2.5 2.5 0 0 1-2.5 2.5h-27A2.5 2.5 0 0 1 8 36.5v-17Z" fill="currentColor" opacity=".16" />
              <path d="M8 19.5 24 10l16 9.5M11 20v16.5a2.5 2.5 0 0 0 2.5 2.5h21a2.5 2.5 0 0 0 2.5-2.5V20M19 39V27h10v12M5 19.5 24 8l19 11.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="m18.7 18.2 2.5-5.7h5.6l2.5 5.7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="brand-name">StockYa</p>
            <p className="brand-caption">Tu tienda en el bolsillo</p>
          </div>
          <span className="secure-pill">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5.5 9V6.8a4.5 4.5 0 0 1 9 0V9m-9.5 0h10a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 15 17H5a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 5 9Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            Enlace seguro
          </span>
        </div>

        <div className="illustration" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="leaf leaf-one" />
          <div className="leaf leaf-two" />
          <div className="box box-back"><span /><i /></div>
          <div className="box box-front"><span /><i /></div>
          <div className="check-bubble">
            <svg viewBox="0 0 36 36" fill="none">
              <path d="m9 18.5 6 6 12-13" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="spark spark-one" />
          <div className="spark spark-two" />
          <div className="spark spark-three" />
        </div>

        <div className="copy">
          <span className="eyebrow"><span className="eyebrow-dot" />{isRecovery ? 'Recupera el acceso a tu tienda' : 'Un paso más y listo'}</span>
          <h1 id="title">{title}</h1>
          <p className="description">
            {isRecovery
              ? isSuccess
                ? 'Tu contraseña se actualizó. Ya puedes volver a StockYa e iniciar sesión.'
                : recoveryVerified
                  ? 'El enlace es válido. Elige una contraseña nueva para tu cuenta.'
                  : 'Valida el enlace seguro que te enviamos y crea una contraseña nueva.'
              : isSuccess
                ? 'Tu dirección quedó verificada. Ya puedes volver a StockYa e iniciar sesión.'
                : 'Verifica tu dirección para mantener tu tienda y tus productos protegidos.'}
          </p>
        </div>

        {visibleMessage || isSuccess || (isRecovery && recoveryVerified) ? (
          <div className={`status ${statusKind}`} role={visibleMessage ? 'alert' : 'status'} aria-live="polite">
            {isSuccess
              ? isRecovery
                ? '¡Listo! Tu nueva contraseña ya está guardada. Regresa a StockYa para iniciar sesión.'
                : '¡Listo! El correo se confirmó correctamente. Regresa a StockYa para entrar a tu tienda.'
              : visibleMessage || 'Enlace validado. Ahora crea tu nueva contraseña.'}
          </div>
        ) : null}

        {isRecovery ? (
          recoveryVerified && !isSuccess ? (
            <form className="password-form" onSubmit={updatePassword}>
              <div className="password-field">
                <label htmlFor="new-password">Nueva contraseña</label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div className="password-field">
                <label htmlFor="confirm-password">Confirma la contraseña</label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                />
              </div>
              <button
                className={`primary-button${isLoading ? ' is-loading' : ''}`}
                type="submit"
                disabled={isLoading}
              >
                <span className="button-label">
                  {isLoading ? 'Guardando contraseña...' : 'Guardar contraseña'}
                </span>
                <span className="button-icon" aria-hidden="true">
                  {isLoading ? <span className="button-spinner" /> : (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              </button>
            </form>
          ) : !isSuccess ? (
            <button
              className={`primary-button${isLoading ? ' is-loading' : ''}`}
              type="button"
              onClick={verifyRecoveryLink}
              disabled={isBlocked || isLoading}
            >
              <span className="button-label">
                {isLoading ? 'Validando enlace...' : 'Validar enlace'}
              </span>
              <span className="button-icon" aria-hidden="true">
                {isLoading ? <span className="button-spinner" /> : (
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            </button>
          ) : null
        ) : (
          <button
            className={`primary-button${isLoading ? ' is-loading' : ''}`}
            type="button"
            onClick={confirmEmail}
            disabled={isBlocked || isLoading || isSuccess}
          >
            <span className="button-label">
              {isLoading ? 'Verificando tu correo...' : isSuccess ? 'Correo confirmado' : 'Confirmar mi correo'}
            </span>
            <span className="button-icon" aria-hidden="true">
              {isLoading ? (
                <span className="button-spinner" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none">
                  {isSuccess ? (
                    <path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
              )}
            </span>
          </button>
        )}

        <p className="fine-print">
          {isRecovery
            ? 'Si no solicitaste cambiar tu contraseña, puedes cerrar esta página. No se realizará ningún cambio.'
            : 'Si no solicitaste esta cuenta, puedes cerrar esta página. No se realizará ningún cambio.'}
        </p>
      </section>

      <footer className="footer">
        <span className="footer-dot" />
        Hecho para quienes mueven su negocio cada día
      </footer>
    </main>
  );
}
