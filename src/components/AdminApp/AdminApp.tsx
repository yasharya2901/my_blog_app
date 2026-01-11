import { useStore } from "@nanostores/react";
import { $router } from "../../lib/stores/router";
import Dashboard from "../Dashboard/Dashboard";

import { useEffect } from "react";
import { redirectPage } from "@nanostores/router";
import Editors from "../Editor/Editor";
import RouteError from "../ErrorPages/RouteError";
import Preview from "../Editor/Preview";


function AdminApp() {
    
    useEffect(() => {
        $router.open(window.location.pathname)
    }, [])
    const page = useStore($router);

    if (!page) {
        return <RouteError/>
    }
    switch (page.route) {
        case "dashboard":
            return <Dashboard/>
        
        case "editor":
            if (!page.params.blogId) {
                redirectPage($router, "dashboard");
                return;
            }
            return <Editors blogId={page.params.blogId} />

        case "preview":
            if (!page.params.blogId) {
                redirectPage($router, "dashboard");
                return;
            }
            return <Preview blogId={page.params.blogId}/>

        default:
            return <RouteError/>
    }
}


export default AdminApp;