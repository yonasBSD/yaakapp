import { HttpRequest } from '../../../src-web/lib/models';

const NEWLINE = '\\\n ';

export function pluginHookExport(request: Partial<HttpRequest>) {
  const xs = ['curl'];

  // Add method and URL all on first line
  if (request.method) xs.push('-X', request.method);
  if (request.url) xs.push(quote(request.url));

  xs.push(NEWLINE);

  // Add URL params
  for (const p of (request.urlParameters ?? []).filter(onlyEnabled)) {
    xs.push('--url-query', quote(`${p.name}=${p.value}`));
    xs.push(NEWLINE);
  }

  // Add headers
  for (const h of (request.headers ?? []).filter(onlyEnabled)) {
    xs.push('--header', quote(`${h.name}: ${h.value}`));
    xs.push(NEWLINE);
  }

  // Add form params
  if (Array.isArray(request.body?.form)) {
    const flag = request.bodyType === 'multipart/form-data' ? '--form' : '--data';
    for (const p of (request.body?.form ?? []).filter(onlyEnabled)) {
      if (p.file) {
        let v = `${p.name}=@${p.file}`;
        v += p.contentType ? `;type=${p.contentType}` : '';
        xs.push(flag, v);
      } else {
        xs.push(flag, quote(`${p.name}=${p.value}`));
      }
      xs.push(NEWLINE);
    }
  } else if (typeof request.body?.text === 'string') {
    // --data-raw $'...' to do special ANSI C quoting
    xs.push('--data-raw', `$${quote(request.body.text)}`);
    xs.push(NEWLINE);
  }

  // Add basic/digest authentication
  if (request.authenticationType === 'basic' || request.authenticationType === 'digest') {
    if (request.authenticationType === 'digest') xs.push('--digest');
    xs.push(
      '--user',
      quote(`${request.authentication?.username ?? ''}:${request.authentication?.password ?? ''}`),
    );
    xs.push(NEWLINE);
  }

  // Add bearer authentication
  if (request.authenticationType === 'bearer') {
    xs.push('--header', quote(`Authorization: Bearer ${request.authentication?.token ?? ''}`));
    xs.push(NEWLINE);
  }

  // Remove trailing newline
  if (xs[xs.length - 1] === NEWLINE) {
    xs.splice(xs.length - 1, 1);
  }

  return xs.join(' ');
}

function quote(arg: string): string {
  const escaped = arg.replace(/'/g, "\\'");
  return `'${escaped}'`;
}

function onlyEnabled(v: { name?: string; enabled?: boolean }): boolean {
  return v.enabled !== false && !!v.name;
}