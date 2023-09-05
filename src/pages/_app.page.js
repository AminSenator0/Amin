import 'layouts/App/reset.css';
import 'layouts/App/global.css';

import { Navbar } from 'components/Navbar';
import { ThemeProvider } from 'components/ThemeProvider';
import { tokens } from 'components/ThemeProvider/theme';
import { VisuallyHidden } from 'components/VisuallyHidden';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion';
import { useFoucFix, useLocalStorage } from 'hooks';
import styles from 'layouts/App/App.module.css';
import { initialState, reducer } from 'layouts/App/reducer';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Fragment, createContext, useEffect, useReducer } from 'react';
import { msToNum } from 'utils/style';
import { ScrollRestore } from '../layouts/App/ScrollRestore';
import dynamic from 'next/dynamic';

export const AppContext = createContext({});

const repoPrompt = String.raw`
__  __  __
________________   
/  _____/\______ \  
/   \  ___ |    |  \ 
\    \_\  \| ___|   \
\______  /_______  /
        \/        \/ 
__  __  __

Tryna Inspect ? OKay 🤖
`;

const AnimatedCursor = dynamic(() => import('react-animated-cursor'), {
  ssr: false,
});

const App = ({ Component, pageProps }) => {
  const [storedTheme] = useLocalStorage('theme', 'dark');
  const [state, dispatch] = useReducer(reducer, initialState);
  const { route, asPath } = useRouter();
  const canonicalRoute = route === '/' ? '' : `${asPath}`;
  useFoucFix();

  useEffect(() => {
    console.info(`${repoPrompt}\n\n`);
  }, []);

  useEffect(() => {
    dispatch({ type: 'setTheme', value: storedTheme || 'dark' });
  }, [storedTheme]);

  return (
    <AppContext.Provider value={{ ...state, dispatch }}>
      <AnimatedCursor
        innerSize={12}
        outerSize={17}
        color='112, 132, 244'
        outerAlpha={0.35}
        innerScale={0.6}
        outerScale={4}
      />
      <ThemeProvider themeId={state.theme}>
        <LazyMotion features={domAnimation}>
          <Fragment>
            <Head>
              <link
                rel="canonical"
                href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}${canonicalRoute}`}
              />
            </Head>
            <VisuallyHidden
              showOnFocus
              as="a"
              className={styles.skip}
              href="#MainContent"
            >
              Skip to main content
            </VisuallyHidden>
            <Navbar />
            <main className={styles.app} tabIndex={-1} id="MainContent">
              <AnimatePresence exitBeforeEnter>
                <m.div
                  key={route}
                  className={styles.page}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: 'tween',
                    ease: 'linear',
                    duration: msToNum(tokens.base.durationS) / 1000,
                    delay: 0.1,
                  }}
                >
                  <ScrollRestore />
                  <Component {...pageProps} />
                </m.div>
              </AnimatePresence>
            </main>
          </Fragment>
        </LazyMotion>
      </ThemeProvider>
    </AppContext.Provider>
  );
};

export default App;
