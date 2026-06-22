const OAUTH_REDIRECT_PARAM_KEYS = ['response_type', 'state', 'redirect_uri', 'scope'] as const;

const appendParams = (target: string, params: URLSearchParams): string => {
  const query = params.toString();

  if (!query) {
    return target;
  }

  const hashIndex = target.indexOf('#');
  const pathAndSearch = hashIndex === -1 ? target : target.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : target.slice(hashIndex);
  const separator = pathAndSearch.includes('?') ? '&' : '?';

  return `${pathAndSearch}${separator}${query}${hash}`;
};

export const buildLoginRedirectUrl = (search: string): string => {
  const queryParams = new URLSearchParams(search);
  const redirectUrl = queryParams.get('redirect');

  if (!redirectUrl) {
    return '';
  }

  const oauthParams = new URLSearchParams();

  for (const key of OAUTH_REDIRECT_PARAM_KEYS) {
    const value = queryParams.get(key);

    if (value) {
      oauthParams.set(key, value);
    }
  }

  return appendParams(redirectUrl, oauthParams);
};
