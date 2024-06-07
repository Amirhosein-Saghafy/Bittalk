import Layout from '../Components/Layout/Layout';
import { Outlet } from 'react-router-dom';

const Index = function () {

    return (
        <Layout>
            <Outlet />
        </Layout>
    );
}

export default Index;