import { Fragment } from "react";
import { Metadata } from "next";

import PageTitle from "@/components/shared/PageTitle";
import SalesOverview from "./_components/SalesOverview";
import StatusOverview from "./_components/StatusOverview";
import DashboardCharts from "./_components/dashboard-charts";
import RecentOrders from "@/app/(dashboard)/orders/_components/orders-table";
import { getUser } from "@/helpers/getUser";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await getUser();
  const welcomeMessage = user?.name 
    ? `Welcome to, ${user.name}` 
    : "Dashboard Overview";

  return (
    <Fragment>
      <section>
        <PageTitle>{welcomeMessage}</PageTitle>

        <div className="space-y-8 mb-8">
          <SalesOverview />
          <StatusOverview />
          <DashboardCharts />
        </div>
      </section>

      <section>
        <PageTitle component="h2">Recent Orders</PageTitle>

        <RecentOrders />
      </section>
    </Fragment>
  );
}
