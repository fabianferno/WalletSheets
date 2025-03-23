export function base64EncodeEnv(envs: Record<string, string>) {
  const encodedEnvs: Record<string, string> = {};
  for (const key in envs) {
    if (envs.hasOwnProperty(key)) {
      encodedEnvs[key] = Buffer.from(envs[key]).toString("base64");
    }
  }

  return encodedEnvs;
}
