import React from "react";
import CreateForm from "./_components/CreateForm";
import FormList from "./_components/FormList";

function Dashboard() {
    return (
        <div className="p-10 min-h-screen bg-white ">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold  mt-12 text-teal-600">📋 Mes Formulaires</h2>
                <CreateForm />
            </div>

            <FormList />
        </div>
    );
}

export default Dashboard;
