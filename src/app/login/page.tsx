import LoginClient from './login-client';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { reset } = await searchParams;
  return <LoginClient passwordReset={reset === '1'} />;
}
