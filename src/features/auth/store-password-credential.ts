type PasswordCredentialConstructor = new (data: {
  id: string;
  password: string;
  name?: string;
}) => Credential;

type PasswordCredentialWindow = Window & {
  PasswordCredential?: PasswordCredentialConstructor;
};

export const storePasswordCredential = async (username: string, password: string) => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return;
  }

  const normalizedUsername = username.trim();
  if (!normalizedUsername || !password) {
    return;
  }

  const credentialWindow = window as PasswordCredentialWindow;
  if (!credentialWindow.PasswordCredential || !navigator.credentials?.store) {
    return;
  }

  try {
    const credential = new credentialWindow.PasswordCredential({
      id: normalizedUsername,
      password,
      name: normalizedUsername,
    });

    await navigator.credentials.store(credential);
  } catch {
    return;
  }
};
