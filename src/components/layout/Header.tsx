"use client";

import { useEffect, useState } from "react";
import {
  TicketIcon,
  List,
  X,
  User,
  SignOut,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { FigmaButton } from "@/components/ui/figma-button";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguageStore } from "@/store/languageStore";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/lib/toast";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BellIcon, CreditCardIcon, LockKeyIcon } from "@phosphor-icons/react";
import { useCompanyInfo } from "@/hooks/useCompany";
import { BadgeDollarSignIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

    const { data: company, isLoading } = useCompanyInfo();
  const handleLogout = async () => {
    const result = await logout();
    // [TODO: Translate Setup]
    toast.success("", result?.message || "Logout Successful");
    router.push("/");
  };
  const handleOrganizeRedirect = () => {
    window.open("https://sandbox-organizer.timroticket.com/login/", "_blank");
  };

  const navigation = [
    { name: t("navigation.events", "Events"), href: "/allevents" },
    // { name: t('navigation.categories'), href: '#categories' },
    { name: t("navigation.about", "About"), href: "/about" },
    { name: t("navigation.contact", "Contact"), href: "/contact" },
  ];
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/20 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
   <Link href="/" className="flex items-center gap-2 py-1.5 hover:opacity-80 transition-opacity">
       
            {mounted ? (
              <>
                {company?.logo_url && (
                  <img
                    src={company.logo_url}
                    alt={company.name || "Company Logo"}
                    className="h-10 py-1"
                  />
                )}
                <span className="text-xl font-bold text-gray-900 font-poppins">
                  {company?.name || "Timro Ticket"}
                </span>
              </>
            ) : (
              /* Fallback/Skeleton to prevent layout shift during hydration */
              <span className="text-xl font-bold text-gray-900 font-poppins">
                Timro Ticket
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <LanguageSelector className="hidden sm:block" />

            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {isAuthenticated && user ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-3 py-1.5 h-auto"
                      >
                        <div className="flex items-center gap-2">
                          <User size={20} className="text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden"
                    >
                      <DropdownMenuLabel className="font-normal px-4 py-2">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/settings/profile"
                                  className={cn(
            "w-full flex items-center gap-2.5 px-4 py-2 text-left cursor-pointer transition-colors duration-200 text-sm font-medium",
           pathname === "/settings/profile" 
              ? "bg-blue-50/80 text-blue-700" 
              : "text-gray-700 hover:bg-gray-50"
          )}
                        > <UserCircle size={18} className={cn(pathname === "/settings/profile" ? "text-blue-700" : "text-gray-500")} />
          <span>{t("navigation.profile", "My Profile")}</span>
          {pathname === "/settings/profile" && (
            <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
          )}
        </Link>
      </DropdownMenuItem>

      {/* Security Link */}
      <DropdownMenuItem asChild>
        <Link
          href="/settings/security"
          className={cn(
            "w-full flex items-center gap-2.5 px-4 py-2 text-left cursor-pointer transition-colors duration-200 text-sm font-medium",
            pathname === "/settings/security" 
              ? "bg-blue-50/80 text-blue-700" 
              : "text-gray-700 hover:bg-gray-50"
          )}
        >
          <LockKeyIcon size={18} className={cn(pathname === "/settings/security" ? "text-blue-700" : "text-gray-500")} />
          <span>{t("navigation.security", "Security")}</span>
          {pathname === "/settings/security" && (
            <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
          )}
        </Link>
      </DropdownMenuItem>

      {/* Transactions Link */}
      <DropdownMenuItem asChild>
        <Link
          href="/settings/transactions"
          className={cn(
            "w-full flex items-center gap-2.5 px-4 py-2 text-left cursor-pointer transition-colors duration-200 text-sm font-medium",
            pathname === "/settings/transactions" 
              ? "bg-blue-50/80 text-blue-700" 
              : "text-gray-700 hover:bg-gray-50"
          )}
        >
          <CreditCardIcon size={18} className={cn(pathname === "/settings/transactions" ? "text-blue-700" : "text-gray-500")} />
          <span>{t("navigation.transactions", "Transactions")}</span>
          {pathname === "/settings/transactions" && (
            <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
          )}
        </Link>
      </DropdownMenuItem>

      {/* Tickets Link */}
      <DropdownMenuItem asChild>
        <Link
          href="/settings/tickets"
          className={cn(
            "w-full flex items-center gap-2.5 px-4 py-2 text-left cursor-pointer transition-colors duration-200 text-sm font-medium",
            pathname === "/settings/tickets" 
              ? "bg-blue-50/80 text-blue-700" 
              : "text-gray-700 hover:bg-gray-50"
          )}
        >
          <TicketIcon size={18} className={cn(pathname === "/settings/tickets" ? "text-blue-700" : "text-gray-500")} />
          <span>{t("navigation.myTickets", "My Tickets")}</span>
          {pathname === "/settings/tickets" && (
            <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
          )}
        </Link>
      </DropdownMenuItem>

      {/* Refunds Link */}
      <DropdownMenuItem asChild>
        <Link
          href="/settings/refunds"
          className={cn(
            "w-full flex items-center gap-2.5 px-4 py-2 text-left cursor-pointer transition-colors duration-200 text-sm font-medium",
            pathname === "/settings/refunds" 
              ? "bg-blue-50/80 text-blue-700" 
              : "text-gray-700 hover:bg-gray-50"
          )}
        >
          <BadgeDollarSignIcon size={18} className={cn(pathname === "/settings/refunds" ? "text-blue-700" : "text-gray-500")} />
          <span>{t("navigation.refund", "My Refunds")}</span>
          {pathname === "/settings/refunds" && (
            <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
          )}
        </Link>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="bg-gray-100" />

      {/* Logout Action Button */}
      <DropdownMenuItem
        onClick={handleLogout}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-left cursor-pointer transition-colors duration-200 text-sm font-medium text-destructive focus:text-destructive focus:bg-red-50"
      >
        <SignOut size={18} className="text-red-500" />
        <span>{t("navigation.logout", "Logout")}</span>
      </DropdownMenuItem>
      
   
  </DropdownMenuContent>
</DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    >
                      <User size={16} className="mr-1" />
                      {t("navigation.signIn", "Sign In")}
                    </Button>
                  </Link>

                  <FigmaButton
                    variant="primary"
                    size="md"
                    showGlow={true}
                    onClick={handleOrganizeRedirect}
                  >
                    {t("navigation.organizeEvent", "Organize Event")}
                  </FigmaButton>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X size={20} className="text-gray-700" />
              ) : (
                <List size={20} className="text-gray-700" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4">
            <div className="space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}

              <div className="pt-4 border-t border-white/20 space-y-3">
                <LanguageSelector />

                <div className="flex flex-col gap-2">
                  {isAuthenticated && user ? (
                    <>
                      <Link
                        href="/settings/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
                          <User size={16} className="text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-gray-700 hover:text-destructive hover:bg-red-50 justify-start w-full"
                      >
                        <SignOut size={16} className="mr-2" />
                        {t("navigation.logout", "Logout")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 justify-start w-full"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User size={16} className="mr-2" />
                          {t("navigation.signIn", "Sign In")}
                        </Button>
                      </Link>
                      <FigmaButton
                        variant="primary"
                        size="md"
                        showGlow={true}
                        onClick={handleOrganizeRedirect}
                      >
                        {t("navigation.organizeEvent", "Organize Event")}
                      </FigmaButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
