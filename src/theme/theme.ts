import { createMuiTheme } from '@material-ui/core';
import { blue, amber } from '@material-ui/core/colors';

export const theme = createMuiTheme({
    palette: {
        type: 'light',
        primary: { main: `${blue[600]}` },
        secondary: { main: `${amber[700]}` },
    },
});
