// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { Suspense } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

// project imports
import Spinner from 'src/views/spinner/Spinner';

// ===========================|| LOADABLE - LAZY LOADING ||=========================== //

const isDynamicImportFailure = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error || '');
  return /Failed to fetch dynamically imported module|Importing a module script failed|Expected a JavaScript-or-Wasm module script|Loading chunk/i.test(
    message,
  );
};

class LazyImportBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (typeof window === 'undefined' || !isDynamicImportFailure(error)) {
      return;
    }

    const reloadKey = `crm-lazy-reload:${window.location.pathname}`;
    if (!window.sessionStorage.getItem(reloadKey)) {
      window.sessionStorage.setItem(reloadKey, '1');
      window.location.reload();
    }
  }

  render() {
    if (this.state.error) {
      return (
        <Box minHeight="60vh" display="flex" alignItems="center" justifyContent="center" px={3}>
          <Stack spacing={2} maxWidth={520}>
            <Typography variant="h5">This page could not be loaded</Typography>
            <Typography variant="body2" color="textSecondary">
              {isDynamicImportFailure(this.state.error)
                ? 'A frontend asset failed to load. Refresh the page to fetch the latest files.'
                : this.state.error.message || 'An unexpected frontend error occurred.'}
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}

const Loadable = (Component: any) => (props: any) =>
  (
    <LazyImportBoundary>
      <Suspense fallback={<Spinner />}>
        <Component {...props} />
      </Suspense>
    </LazyImportBoundary>
  );

export default Loadable;
