export default function ConsentScreen() {
  const searchParams = new URLSearchParams(window.location.search);

  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const scopes = searchParams.get("scope");

  return (
    <>
      <h1 className="text-3xl font-semibold sm:text-4xl">
        Authorize this application
      </h1>
      <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-white/5 p-6 text-left sm:p-8">
        <p>This page is used for OAuth authorization consent.</p>
        {clientId && (
          <p>
            <strong>Client ID:</strong> {clientId}
          </p>
        )}
        {redirectUri && (
          <p>
            <strong>Redirect URI:</strong> {redirectUri}
          </p>
        )}
        {scopes && (
          <p>
            <strong>Scopes:</strong> {scopes}
          </p>
        )}
      </div>
    </>
  );
}

