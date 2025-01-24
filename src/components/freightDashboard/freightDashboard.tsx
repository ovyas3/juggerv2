import styles from './styles/freightDashboard.module.css';
import { FreightCostTrends } from './components/FreightCostTrends';
import { FreightCostByRegion } from './components/FreightCostByRegion';
import { FreightCostDrilldown } from './components/FreightCostDrilldown';
import { useMediaQuery, useTheme } from '@mui/material';

export default function FreightDashboard() {
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <div
            className={styles.container}
            style={{ margin: !mobile ? '56px 0 0 70px' : '0px' }}
        >
            {mobile ? (
                <h1 className={styles.title}>Freight Trends Dashboard</h1>
            ) : (
                <></>
            )}
            <div className={styles.grid}>
                <FreightCostTrends />
                <FreightCostByRegion />
            </div>
            <FreightCostDrilldown />
        </div>
    );
};
