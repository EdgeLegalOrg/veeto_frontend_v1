import React from 'react';
import { Routes, Route } from 'react-router-dom';

//Layouts
import NonAuthLayout from '../Layouts/NonAuthLayout';
import VerticalLayout from '../Layouts/index';

//routes
import { authProtectedRoutes, publicRoutes } from './allRoutes';
import { AuthProtected } from './AuthProtected';

// The system admin portal has its own sign-in, token and layout, so it is
// mounted here directly rather than through authProtectedRoutes, which are
// guarded by the application's own session.
import AdminPortalApp from '../pages/AdminPortal/AdminPortalApp';

const Index = () => {
  return (
    <React.Fragment>
      <Routes>
        <Route path='/admin-portal/*' element={<AdminPortalApp />} />
        <Route>
          {publicRoutes.map((route, idx) => (
            <Route
              path={route.path}
              element={<NonAuthLayout>{route.component}</NonAuthLayout>}
              key={idx}
              exact={true}
            />
          ))}
        </Route>

        <Route>
          {authProtectedRoutes.map((route, idx) => {
            if (route.outsideLayout) {
              return (
                <Route
                  path={route.path}
                  element={<AuthProtected>{route.component}</AuthProtected>}
                  key={idx}
                  exact={true}
                />
              );
            } else {
              return (
                <Route
                  path={route.path}
                  element={
                    <AuthProtected>
                      <VerticalLayout>{route.component}</VerticalLayout>
                    </AuthProtected>
                  }
                  key={idx}
                  exact={true}
                />
              );
            }
          })}
        </Route>
      </Routes>
    </React.Fragment>
  );
};

export default Index;
