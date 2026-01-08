import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { format } from "date-fns";

import PageTitle from "@/components/shared/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Typography from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ContactBadgeVariants } from "@/constants/badge";
import { fetchContactById } from "@/services/contacts";
import { Contact } from "@/services/contacts/types";

type PageParams = {
  params: {
    id: string;
  };
};

// Server-side function to fetch contact details
async function fetchContactDetailsServer(id: string): Promise<Contact> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Authentication required");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const response = await fetch(
    `${apiUrl}/api/contacts/get-contact-by-id/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 404) {
      throw new Error("Contact not found");
    }
    throw new Error(errorData?.message || "Failed to fetch contact details");
  }

  const data = await response.json();

  if (!data.success || !data.contact) {
    throw new Error(data.message || "Failed to fetch contact details");
  }

  // Transform backend contact to frontend format
  const backendContact = data.contact;
  return {
    id: backendContact._id || backendContact.id || "",
    name: backendContact.name,
    email: backendContact.email,
    phone: backendContact.phone || null,
    subject: backendContact.subject || null,
    message: backendContact.message,
    status: backendContact.status || "unread",
    created_at: backendContact.createdAt || backendContact.created_at || new Date().toISOString(),
    updated_at: backendContact.updatedAt || backendContact.updated_at || new Date().toISOString(),
  };
}

export async function generateMetadata({
  params: { id },
}: PageParams): Promise<Metadata> {
  try {
    const contact = await fetchContactDetailsServer(id);
    return { title: `Contact from ${contact.name}` };
  } catch (e) {
    return { title: "Contact not found" };
  }
}

export default async function ContactDetail({ params: { id } }: PageParams) {
  try {
    const contact = await fetchContactDetailsServer(id);

    return (
      <section className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <Link href="/contacts">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Contacts
            </Button>
          </Link>
          <PageTitle className="mb-0">Contact Details</PageTitle>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                  <span>Contact Information</span>
                  <Badge
                    variant={ContactBadgeVariants[contact.status]}
                    className="text-xs capitalize"
                  >
                    {contact.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Typography
                      variant="p"
                      className="text-sm font-semibold text-muted-foreground mb-1"
                    >
                      Name
                    </Typography>
                    <Typography className="text-base capitalize">
                      {contact.name}
                    </Typography>
                  </div>

                  <div>
                    <Typography
                      variant="p"
                      className="text-sm font-semibold text-muted-foreground mb-1"
                    >
                      Email
                    </Typography>
                    <Typography className="text-base break-words">
                      {contact.email}
                    </Typography>
                  </div>

                  <div>
                    <Typography
                      variant="p"
                      className="text-sm font-semibold text-muted-foreground mb-1"
                    >
                      Phone
                    </Typography>
                    <Typography className="text-base">
                      {contact.phone || "—"}
                    </Typography>
                  </div>

                  <div>
                    <Typography
                      variant="p"
                      className="text-sm font-semibold text-muted-foreground mb-1"
                    >
                      Date Submitted
                    </Typography>
                    <Typography className="text-base">
                      {format(new Date(contact.created_at), "PPp")}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Message Card */}
            <Card>
              <CardHeader>
                <CardTitle>Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contact.subject && (
                  <div>
                    <Typography
                      variant="p"
                      className="text-sm font-semibold text-muted-foreground mb-2"
                    >
                      Subject
                    </Typography>
                    <Typography className="text-base">
                      {contact.subject}
                    </Typography>
                  </div>
                )}

                <Separator />

                <div>
                  <Typography
                    variant="p"
                    className="text-sm font-semibold text-muted-foreground mb-2"
                  >
                    Message
                  </Typography>
                  <Typography className="text-base whitespace-pre-wrap break-words">
                    {contact.message}
                  </Typography>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div>
                    <Typography
                      variant="p"
                      className="text-sm font-semibold text-muted-foreground mb-2"
                    >
                      Current Status
                    </Typography>
                    <Badge
                      variant={ContactBadgeVariants[contact.status]}
                      className="text-sm capitalize"
                    >
                      {contact.status}
                    </Badge>
                  </div>

                  <Separator />

                  <div>
                    <Typography
                      variant="p"
                      className="text-sm font-semibold text-muted-foreground mb-1"
                    >
                      Submitted
                    </Typography>
                    <Typography className="text-sm">
                      {format(new Date(contact.created_at), "PPp")}
                    </Typography>
                  </div>

                  {contact.updated_at && contact.updated_at !== contact.created_at && (
                    <>
                      <Separator />
                      <div>
                        <Typography
                          variant="p"
                          className="text-sm font-semibold text-muted-foreground mb-1"
                        >
                          Last Updated
                        </Typography>
                        <Typography className="text-sm">
                          {format(new Date(contact.updated_at), "PPp")}
                        </Typography>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  } catch (e) {
    return notFound();
  }
}
