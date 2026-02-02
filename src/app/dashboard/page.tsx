"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { dashboardAPI, appointmentsAPI, providersAPI, type DashboardData, type Appointment, type Provider } from "@/lib/api";
import { calculateAge, formatDate, getSeverityColor, getSeverityBgClass } from "@/lib/utils";
import {
  LogOut,
  Calendar,
  Activity,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Brain,
  Edit,
  X,
  Upload,
  Heart,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  PhoneOff,
  RefreshCw,
  Undo2,
  Trash2,
  FileDown,
  Bell,
  BellOff,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type SeverityFilter = "all" | "high" | "medium" | "low";
type DateSort = "newest" | "oldest";
type DateRange = "1week" | "1month" | "3months" | "1year" | "custom" | "all";
type AppointmentStatus = "upcoming" | "done" | "cancelled" | "cancellation_in_progress" | "cancellation_failed" | "rescheduling_in_progress" | "rescheduling_failed" | "rescheduled" | "completed";

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Table filters
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [dateSort, setDateSort] = useState<DateSort>("newest");
  const [showTableFilters, setShowTableFilters] = useState(false);

  // Chart filters
  const [chartDateRange, setChartDateRange] = useState<DateRange>("1month");
  const [chartSeverityFilter, setChartSeverityFilter] = useState<SeverityFilter>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // UI state
  const [showChartFilters, setShowChartFilters] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // Edit profile state
  const [editFamilyHistory, setEditFamilyHistory] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Add Entry state
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const [customSymptom, setCustomSymptom] = useState("");
  const [symptomSearch, setSymptomSearch] = useState("");
  const [entrySeverity, setEntrySeverity] = useState<"low" | "medium" | "high">("low");
  const [entryNote, setEntryNote] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Toast notifications
  const [showEntryConfirmation, setShowEntryConfirmation] = useState(false);
  const [showChangesSaved, setShowChangesSaved] = useState(false);
  const [showReportGenerated, setShowReportGenerated] = useState(false);
  const [showLoggedOut, setShowLoggedOut] = useState(false);
  const [showAppointmentAdded, setShowAppointmentAdded] = useState(false);

  // AI Insights state
  const [aiInsights, setAiInsights] = useState<{
    insights: string[];
    recommendations: string[];
    summary: string;
    loading: boolean;
    error: string | null;
  }>({
    insights: [],
    recommendations: [],
    summary: "",
    loading: false,
    error: null,
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;
  
  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<"all" | AppointmentStatus>("all");
  
  // Providers state
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  
  // New appointment form
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    location: "",
    date: "",
    time: "",
    reminderEnabled: true,
    notes: "",
  });
  
  // Cancel/Reschedule form
  const [actionForm, setActionForm] = useState({
    preferredCallHour: 10,
    newDate: "",
    newTime: "",
  });
  
  // Family health history options
  const familyHistoryOptions = [
    "Diabetes", "Heart Disease", "High Blood Pressure", "Cancer", 
    "Depression", "Anxiety", "Alzheimer's", "Asthma", 
    "Arthritis", "Stroke", "Thyroid Disorder", "None"
  ];
  
  // Common symptoms with recommended severity
  const commonSymptoms: { name: string; recommendedSeverity: "low" | "medium" | "high" }[] = [
    { name: "Headache", recommendedSeverity: "low" },
    { name: "Migraine", recommendedSeverity: "high" },
    { name: "Fatigue", recommendedSeverity: "low" },
    { name: "Fever", recommendedSeverity: "medium" },
    { name: "High Fever (>103°F)", recommendedSeverity: "high" },
    { name: "Cough", recommendedSeverity: "low" },
    { name: "Persistent Cough", recommendedSeverity: "medium" },
    { name: "Shortness of Breath", recommendedSeverity: "high" },
    { name: "Chest Pain", recommendedSeverity: "high" },
    { name: "Back Pain", recommendedSeverity: "medium" },
    { name: "Joint Pain", recommendedSeverity: "medium" },
    { name: "Muscle Aches", recommendedSeverity: "low" },
    { name: "Nausea", recommendedSeverity: "low" },
    { name: "Vomiting", recommendedSeverity: "medium" },
    { name: "Diarrhea", recommendedSeverity: "medium" },
    { name: "Constipation", recommendedSeverity: "low" },
    { name: "Stomach Pain", recommendedSeverity: "medium" },
    { name: "Dizziness", recommendedSeverity: "medium" },
    { name: "Fainting", recommendedSeverity: "high" },
    { name: "Blurred Vision", recommendedSeverity: "medium" },
    { name: "Sore Throat", recommendedSeverity: "low" },
    { name: "Runny Nose", recommendedSeverity: "low" },
    { name: "Congestion", recommendedSeverity: "low" },
    { name: "Sneezing", recommendedSeverity: "low" },
    { name: "Ear Pain", recommendedSeverity: "medium" },
    { name: "Skin Rash", recommendedSeverity: "medium" },
    { name: "Itching", recommendedSeverity: "low" },
    { name: "Swelling", recommendedSeverity: "medium" },
    { name: "Numbness", recommendedSeverity: "medium" },
    { name: "Tingling", recommendedSeverity: "low" },
    { name: "Anxiety", recommendedSeverity: "medium" },
    { name: "Depression", recommendedSeverity: "medium" },
    { name: "Insomnia", recommendedSeverity: "low" },
    { name: "Loss of Appetite", recommendedSeverity: "low" },
    { name: "Weight Loss", recommendedSeverity: "medium" },
    { name: "Difficulty Swallowing", recommendedSeverity: "high" },
    { name: "Heart Palpitations", recommendedSeverity: "high" },
    { name: "Cold Sweats", recommendedSeverity: "medium" },
    { name: "Night Sweats", recommendedSeverity: "medium" },
    { name: "Chills", recommendedSeverity: "low" },
  ];
  
  // Filter symptoms based on search
  const filteredSymptoms = commonSymptoms.filter(s => 
    s.name.toLowerCase().includes(symptomSearch.toLowerCase())
  );

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/");
      return;
    }

    // Load dashboard data from API
    const loadData = async () => {
      try {
        const data = await dashboardAPI.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Load appointments from API
    const loadAppointments = async () => {
      try {
        const response = await appointmentsAPI.getAppointments();
        if (response.success && response.data) {
          setAppointments(response.data);
        }
      } catch (error) {
        console.error("Failed to load appointments:", error);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    // Load providers from API
    const loadProviders = async () => {
      try {
        const response = await providersAPI.getProviders();
        if (response.success && response.data) {
          setProviders(response.data);
        }
      } catch (error) {
        console.error("Failed to load providers:", error);
      }
    };

    // Load AI insights
    const loadAIInsights = async () => {
      setAiInsights(prev => ({ ...prev, loading: true, error: null }));
      try {
        const response = await dashboardAPI.getAIInsights();
        if (response.success && response.data) {
          setAiInsights({
            insights: response.data.insights || [],
            recommendations: response.data.recommendations || [],
            summary: response.data.summary || "",
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Failed to load AI insights:", error);
        setAiInsights(prev => ({
          ...prev,
          loading: false,
          error: "Unable to load AI insights",
        }));
      }
    };

    loadData();
    loadAppointments();
    loadProviders();
    loadAIInsights();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setShowLoggedOut(true);
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  // Appointment helpers
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatAppointmentDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const styles: Record<AppointmentStatus, { bg: string; text: string; label: string }> = {
      upcoming: { bg: "bg-blue-100", text: "text-blue-700", label: "Upcoming" },
      done: { bg: "bg-green-100", text: "text-green-700", label: "Done" },
      completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
      cancelled: { bg: "bg-gray-100", text: "text-gray-700", label: "Cancelled" },
      cancellation_in_progress: { bg: "bg-orange-100", text: "text-orange-700", label: "Cancelling..." },
      cancellation_failed: { bg: "bg-red-100", text: "text-red-700", label: "Cancel Failed" },
      rescheduling_in_progress: { bg: "bg-purple-100", text: "text-purple-700", label: "Rescheduling..." },
      rescheduling_failed: { bg: "bg-red-100", text: "text-red-700", label: "Reschedule Failed" },
      rescheduled: { bg: "bg-teal-100", text: "text-teal-700", label: "Rescheduled" },
    };
    const style = styles[status] || styles.upcoming;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  // Get next upcoming appointment
  const nextAppointment = appointments
    .filter(a => a.status === "upcoming" && new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  // Filter appointments
  const filteredAppointments = appointments.filter(a => 
    appointmentStatusFilter === "all" || a.status === appointmentStatusFilter
  );

  // Appointment handlers
  const handleAddAppointment = async () => {
    if (!newAppointment.title || !newAppointment.date || !newAppointment.time || !selectedProviderId) return;
    
    try {
      const response = await appointmentsAPI.createAppointment({
        providerId: selectedProviderId === "none" ? undefined : selectedProviderId,
        title: newAppointment.title,
        appointmentDate: newAppointment.date,
        appointmentTime: newAppointment.time,
        location: newAppointment.location || undefined,
        reminderEnabled: newAppointment.reminderEnabled,
        notes: newAppointment.notes || undefined,
      });
      
      if (response.success && response.data) {
        setAppointments(prev => [...prev, response.data]);
        setShowAddAppointment(false);
        setNewAppointment({
          title: "",
          location: "",
          date: "",
          time: "",
          reminderEnabled: true,
          notes: "",
        });
        setSelectedProviderId("");
        setShowAppointmentAdded(true);
        setTimeout(() => setShowAppointmentAdded(false), 5000);
      }
    } catch (error) {
      console.error("Failed to create appointment:", error);
    }
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (!confirm(`Are you sure you want to delete "${appointment.title}"? This cannot be undone.`)) return;
    
    try {
      // Optimistically remove from UI
      setAppointments(prev => prev.filter(a => a.id !== appointment.id));
      
      await appointmentsAPI.deleteAppointment(appointment.id);
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      // Restore on error
      setAppointments(prev => [...prev, appointment]);
    }
  };

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const submitCancellation = async () => {
    if (!selectedAppointment) return;
    
    try {
      // Optimistically update UI
      setAppointments(prev => prev.map(a => 
        a.id === selectedAppointment.id 
          ? { ...a, status: "cancellation_in_progress", previousStatus: a.status, canUndo: true }
          : a
      ));
      
      // Call API
      await appointmentsAPI.cancelAppointment(
        selectedAppointment.id,
        undefined,
        actionForm.preferredCallHour
      );
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      // Revert on error
      setAppointments(prev => prev.map(a => 
        a.id === selectedAppointment.id && a.previousStatus
          ? { ...a, status: a.previousStatus, previousStatus: undefined, canUndo: false }
          : a
      ));
    }
    
    setShowCancelModal(false);
    setSelectedAppointment(null);
  };

  const submitReschedule = async () => {
    if (!selectedAppointment || !actionForm.newDate || !actionForm.newTime) return;
    
    try {
      // Optimistically update UI
      setAppointments(prev => prev.map(a => 
        a.id === selectedAppointment.id 
          ? { ...a, status: "rescheduling_in_progress", previousStatus: a.status, canUndo: true }
          : a
      ));
      
      // Call API
      await appointmentsAPI.rescheduleAppointment(
        selectedAppointment.id,
        actionForm.newDate,
        actionForm.newTime,
        undefined,
        actionForm.preferredCallHour
      );
    } catch (error) {
      console.error("Failed to reschedule appointment:", error);
      // Revert on error
      setAppointments(prev => prev.map(a => 
        a.id === selectedAppointment.id && a.previousStatus
          ? { ...a, status: a.previousStatus, previousStatus: undefined, canUndo: false }
          : a
      ));
    }
    
    setShowRescheduleModal(false);
    setSelectedAppointment(null);
    setActionForm({ preferredCallHour: 10, newDate: "", newTime: "" });
  };

  const handleUndoAction = async (appointment: Appointment) => {
    if (!appointment.canUndo || !appointment.previousStatus) return;
    
    try {
      // Optimistically update UI
      setAppointments(prev => prev.map(a => 
        a.id === appointment.id 
          ? { ...a, status: appointment.previousStatus!, previousStatus: undefined, canUndo: false }
          : a
      ));
      
      // Call API
      await appointmentsAPI.undoAction(appointment.id);
    } catch (error) {
      console.error("Failed to undo action:", error);
    }
  };

  const toggleReminder = async (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;
    
    const newEnabled = !appointment.reminderEnabled;
    
    // Optimistically update UI
    setAppointments(prev => prev.map(a => 
      a.id === appointmentId ? { ...a, reminderEnabled: newEnabled } : a
    ));
    
    try {
      await appointmentsAPI.toggleReminder(appointmentId, newEnabled);
    } catch (error) {
      console.error("Failed to toggle reminder:", error);
      // Revert on error
      setAppointments(prev => prev.map(a => 
        a.id === appointmentId ? { ...a, reminderEnabled: !newEnabled } : a
      ));
    }
  };

  // Generate PDF Health Report
  const generateHealthReport = () => {
    if (!dashboardData) return;
    
    const { user, recentEntries, stats } = dashboardData;
    
    // Calculate symptom distribution
    const symptomCounts: Record<string, number> = {};
    recentEntries.forEach(entry => {
      symptomCounts[entry.symptoms] = (symptomCounts[entry.symptoms] || 0) + 1;
    });
    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // Calculate severity distribution
    const severityCounts = { high: 0, medium: 0, low: 0 };
    recentEntries.forEach(entry => {
      severityCounts[entry.severity]++;
    });
    
    // Entries over time (last 30 days)
    const last30Days: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      last30Days[date.toISOString().split('T')[0]] = 0;
    }
    recentEntries.forEach(entry => {
      if (last30Days[entry.date] !== undefined) {
        last30Days[entry.date]++;
      }
    });
    
    // Create HTML content for PDF
    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Health Report - ${user.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #0d9488; }
          .date { color: #6b7280; }
          .section { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 15px 0; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
          .stat-box { background: white; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 28px; font-weight: bold; color: #0d9488; }
          .stat-label { color: #6b7280; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f3f4f6; font-weight: 600; }
          .severity-high { color: #dc2626; }
          .severity-medium { color: #f59e0b; }
          .severity-low { color: #22c55e; }
          .insight-box { background: #ecfdf5; border-left: 4px solid #0d9488; padding: 15px; margin: 15px 0; }
          .chart-placeholder { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; }
          .entries-timeline { background: white; padding: 15px; border-radius: 8px; }
          .timeline-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #e5e7eb; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">AveloHealth</div>
          <div class="date">Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        
        <h1>Health Report</h1>
        
        <h2>Patient Summary</h2>
        <div class="section">
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">${user.name}</div>
              <div class="stat-label">Patient Name</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${calculateAge(user.dateOfBirth)}</div>
              <div class="stat-label">Age</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.totalEntries}</div>
              <div class="stat-label">Total Entries</div>
            </div>
          </div>
          <table>
            <tr><td><strong>Email:</strong></td><td>${user.email}</td></tr>
            <tr><td><strong>Phone:</strong></td><td>${user.phoneNumber}</td></tr>
            <tr><td><strong>Date of Birth:</strong></td><td>${formatDate(user.dateOfBirth)}</td></tr>
            <tr><td><strong>Account Number:</strong></td><td>${user.accountNumber}</td></tr>
          </table>
        </div>
        
        <h2>AI Health Insights</h2>
        <div class="section">
          <div class="insight-box">
            <strong>Pattern Analysis:</strong> ${
              severityCounts.high > 0 
                ? `You have ${severityCounts.high} high-severity entries that may need attention.` 
                : 'No high-severity entries recorded recently.'
            }
          </div>
          <div class="insight-box">
            <strong>Most Common Symptoms:</strong> ${topSymptoms.length > 0 ? topSymptoms.map(([s]) => s).join(', ') : 'No symptoms recorded'}
          </div>
          <div class="insight-box">
            <strong>Tracking Summary:</strong> You've logged ${stats.totalEntries} entries total. Regular tracking helps identify patterns and trends.
          </div>
        </div>
        
        <h2>Symptoms Distribution</h2>
        <div class="section">
          <table>
            <thead>
              <tr><th>Symptom</th><th>Count</th><th>Percentage</th></tr>
            </thead>
            <tbody>
              ${topSymptoms.map(([symptom, count]) => `
                <tr>
                  <td>${symptom}</td>
                  <td>${count}</td>
                  <td>${((count / recentEntries.length) * 100).toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <h3>Severity Distribution</h3>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value severity-high">${severityCounts.high}</div>
              <div class="stat-label">High Severity</div>
            </div>
            <div class="stat-box">
              <div class="stat-value severity-medium">${severityCounts.medium}</div>
              <div class="stat-label">Medium Severity</div>
            </div>
            <div class="stat-box">
              <div class="stat-value severity-low">${severityCounts.low}</div>
              <div class="stat-label">Low Severity</div>
            </div>
          </div>
        </div>
        
        <h2>Entries Over Time (Last 30 Days)</h2>
        <div class="section">
          <div class="entries-timeline">
            ${Object.entries(last30Days).map(([date, count]) => `
              <div class="timeline-row">
                <span>${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span>${count} ${count === 1 ? 'entry' : 'entries'}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <h2>Recent Entries</h2>
        <div class="section">
          <table>
            <thead>
              <tr><th>Date</th><th>Symptoms</th><th>Severity</th><th>Category</th><th>Notes</th></tr>
            </thead>
            <tbody>
              ${recentEntries.slice(0, 20).map(entry => `
                <tr>
                  <td>${formatDate(entry.date)}</td>
                  <td>${entry.symptoms}</td>
                  <td class="severity-${entry.severity}">${entry.severity}</td>
                  <td>${entry.category}</td>
                  <td>${entry.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p>This report was generated by AveloHealth for informational purposes only. Please consult with your healthcare provider for medical advice.</p>
          <p>Report ID: ${Date.now()}</p>
        </div>
      </body>
      </html>
    `;
    
    // Open in new window for printing/saving as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportContent);
      printWindow.document.close();
      printWindow.print();
    }
    
    setShowReportGenerated(true);
    setTimeout(() => setShowReportGenerated(false), 5000);
  };

  // Filter and sort entries for table
  const allFilteredEntries = useMemo(() => {
    if (!dashboardData) return [];

    let entries = [...dashboardData.recentEntries];

    // Filter by severity
    if (severityFilter !== "all") {
      entries = entries.filter((e) => e.severity === severityFilter);
    }

    // Sort by date
    entries.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateSort === "newest" ? dateB - dateA : dateA - dateB;
    });

    return entries;
  }, [dashboardData, severityFilter, dateSort]);

  // Paginated entries
  const filteredEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return allFilteredEntries.slice(startIndex, startIndex + entriesPerPage);
  }, [allFilteredEntries, currentPage, entriesPerPage]);

  // Total pages
  const totalPages = Math.ceil(allFilteredEntries.length / entriesPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [severityFilter, dateSort]);

  // Get date range for charts
  const getDateRangeFilter = (): { start: Date; end: Date } => {
    const end = new Date();
    let start = new Date();

    switch (chartDateRange) {
      case "1week":
        start.setDate(end.getDate() - 7);
        break;
      case "1month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "3months":
        start.setMonth(end.getMonth() - 3);
        break;
      case "1year":
        start.setFullYear(end.getFullYear() - 1);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          start = new Date(customStartDate);
          return { start, end: new Date(customEndDate) };
        }
        start.setMonth(end.getMonth() - 1);
        break;
      case "all":
        // Use first entry date as start
        if (dashboardData && dashboardData.recentEntries.length > 0) {
          const dates = dashboardData.recentEntries.map(e => new Date(e.date).getTime());
          start = new Date(Math.min(...dates));
        } else {
          start.setFullYear(end.getFullYear() - 1);
        }
        break;
    }

    return { start, end };
  };

  // Filter chart data
  const filteredChartData = useMemo(() => {
    if (!dashboardData) return { lineData: [], pieData: [] };

    const { start, end } = getDateRangeFilter();

    // Filter entries by date range and severity only (removed category filter)
    let filteredEntries = dashboardData.recentEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const inDateRange = entryDate >= start && entryDate <= end;
      const matchesSeverity = chartSeverityFilter === "all" || entry.severity === chartSeverityFilter;
      return inDateRange && matchesSeverity;
    });

    // Generate line chart data
    const lineData: { date: string; high: number; medium: number; low: number; total: number }[] = [];
    const dayCount = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const interval = dayCount > 60 ? 7 : dayCount > 14 ? 3 : 1;

    for (let i = 0; i <= dayCount; i += interval) {
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(start.getTime() + (i + interval) * 24 * 60 * 60 * 1000);

      const periodEntries = filteredEntries.filter((e) => {
        const eDate = new Date(e.date);
        return eDate >= date && eDate < nextDate;
      });

      lineData.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        high: periodEntries.filter((e) => e.severity === "high").length,
        medium: periodEntries.filter((e) => e.severity === "medium").length,
        low: periodEntries.filter((e) => e.severity === "low").length,
        total: periodEntries.length,
      });
    }

    // Generate pie chart data by SYMPTOMS (not category)
    const symptomMap = new Map<string, number>();
    filteredEntries.forEach((entry) => {
      // Split symptoms by comma and count each
      const symptoms = entry.symptoms.split(",").map(s => s.trim());
      symptoms.forEach(symptom => {
        if (symptom) {
          symptomMap.set(symptom, (symptomMap.get(symptom) || 0) + 1);
        }
      });
    });

    const pieData = Array.from(symptomMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    return { lineData, pieData };
  }, [dashboardData, chartDateRange, chartSeverityFilter, customStartDate, customEndDate]);

  // Get unique symptoms for reference
  const uniqueSymptoms = useMemo(() => {
    if (!dashboardData) return [];
    const symptoms = new Set<string>();
    dashboardData.recentEntries.forEach(e => {
      e.symptoms.split(",").map(s => s.trim()).forEach(s => {
        if (s) symptoms.add(s);
      });
    });
    return Array.from(symptoms);
  }, [dashboardData]);

  const PIE_COLORS = ["#2dd4bf", "#22c55e", "#eab308", "#f97316", "#ef4444", "#8b5cf6", "#ec4899"];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[hsl(174,62%,47%)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Failed to load dashboard data.</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const { user, stats } = dashboardData;
  const age = calculateAge(user.dateOfBirth);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" />
            
            <div className="flex items-center gap-3">
              <Button 
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => setShowAddAppointment(true)}
              >
                <Calendar size={18} />
                <span className="hidden sm:inline">Add Appointment</span>
              </Button>
              
              <Button 
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                onClick={() => {
                  setShowAddEntry(true);
                  setSelectedSymptom("");
                  setCustomSymptom("");
                  setSymptomSearch("");
                  setEntrySeverity("low");
                  setEntryDate(new Date().toISOString().split('T')[0]);
                }}
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Entry</span>
              </Button>
              
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut size={18} />
                <span className="hidden sm:inline">Log Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* User Summary Card */}
          <Card className="animate-fade-in overflow-hidden">
            <div className="bg-gradient-to-r from-[hsl(174,62%,47%)] to-[hsl(174,62%,37%)] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Patient Summary</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20"
                onClick={() => setShowEditProfile(true)}
              >
                <Edit size={16} className="mr-2" />
                Edit Profile
              </Button>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Avatar and basic info */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(174,62%,47%)] to-[hsl(174,62%,37%)] flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                    <div className="flex items-center gap-4 text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {formatDate(user.dateOfBirth)} ({age} years old)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats and Family Health History */}
                <div className="flex-1 md:ml-auto md:max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-pink-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Heart size={16} className="text-pink-500" />
                        <p className="text-sm font-semibold text-gray-700">Family Health History</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {editFamilyHistory.length > 0 ? (
                          editFamilyHistory.map((item) => (
                            <span key={item} className="text-xs bg-white px-2 py-0.5 rounded-full text-gray-600">
                              {item}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">Not specified</span>
                        )}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-3xl font-bold text-[hsl(174,62%,47%)]">{stats.totalEntries}</p>
                      <p className="text-xs text-gray-500">Total Entries</p>
                    </div>
                    
                    {/* Next Appointment */}
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={14} className="text-blue-600" />
                        <p className="text-xs font-semibold text-blue-700">Next Appointment</p>
                      </div>
                      {nextAppointment ? (
                        <div>
                          <p className="text-sm font-medium text-gray-800">{nextAppointment.title}</p>
                          <p className="text-xs text-gray-600">{nextAppointment.providerName}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-blue-700">
                            <span className="font-medium">{formatAppointmentDate(nextAppointment.date)}</span>
                            <span>•</span>
                            <span>{formatTime(nextAppointment.time)}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No upcoming appointments</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Entries Table */}
          <Card className="animate-fade-in delay-150">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity size={20} className="text-[hsl(174,62%,47%)]" />
                Entries
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTableFilters(!showTableFilters)}
                  className="flex items-center gap-1"
                >
                  <Filter size={16} />
                  Filters
                  {showTableFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
              </div>
            </CardHeader>

            {showTableFilters && (
              <div className="px-6 pb-4 flex flex-wrap gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Severity</label>
                  <Select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
                    options={[
                      { value: "all", label: "All Severities" },
                      { value: "high", label: "High" },
                      { value: "medium", label: "Medium" },
                      { value: "low", label: "Low" },
                    ]}
                    className="w-36"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sort by Date</label>
                  <Select
                    value={dateSort}
                    onChange={(e) => setDateSort(e.target.value as DateSort)}
                    options={[
                      { value: "newest", label: "Newest First" },
                      { value: "oldest", label: "Oldest First" },
                    ]}
                    className="w-36"
                  />
                </div>
              </div>
            )}

            <CardContent>
              {filteredEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No entries found for the selected filters
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Symptom</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Severity</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEntries.map((entry) => (
                          <tr key={entry.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-sm">{formatDate(entry.date)}</td>
                            <td className="py-3 px-4 text-sm font-medium">{entry.symptoms}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBgClass(
                                  entry.severity
                                )}`}
                              >
                                {entry.severity.charAt(0).toUpperCase() + entry.severity.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">
                              {entry.notes || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                        {Math.min(currentPage * entriesPerPage, allFilteredEntries.length)} of{" "}
                        {allFilteredEntries.length} entries
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft size={16} />
                        </Button>
                        <span className="text-sm px-3">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Appointments Table */}
          <Card className="animate-fade-in delay-175">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} className="text-blue-500" />
                Appointments
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={appointmentStatusFilter}
                  onChange={(e) => setAppointmentStatusFilter(e.target.value as "all" | AppointmentStatus)}
                  options={[
                    { value: "all", label: "All Status" },
                    { value: "upcoming", label: "Upcoming" },
                    { value: "done", label: "Done" },
                    { value: "cancelled", label: "Cancelled" },
                  ]}
                  className="w-36"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No appointments found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Appointment</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Provider</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Date & Time</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Reminder</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-800">{appointment.title}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin size={12} />
                                {appointment.location}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-sm text-gray-700">{appointment.providerName}</p>
                              <p className="text-xs text-gray-500">{appointment.providerPhone}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-gray-700">{formatAppointmentDate(appointment.date)}</span>
                              <Clock size={14} className="text-gray-400 ml-2" />
                              <span className="text-gray-700">{formatTime(appointment.time)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(appointment.status as AppointmentStatus)}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleReminder(appointment.id)}
                              disabled={appointment.status !== "upcoming"}
                              className={`p-1.5 rounded-lg transition-colors ${
                                appointment.status !== "upcoming" 
                                  ? "opacity-50 cursor-not-allowed" 
                                  : appointment.reminderEnabled 
                                    ? "text-[hsl(174,62%,47%)] hover:bg-[hsl(174,62%,95%)]" 
                                    : "text-gray-400 hover:bg-gray-100"
                              }`}
                            >
                              {appointment.reminderEnabled ? <Bell size={16} /> : <BellOff size={16} />}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-1">
                              {/* Undo (for in-progress actions) */}
                              {appointment.canUndo && (appointment.status === "cancellation_in_progress" || appointment.status === "rescheduling_in_progress") && (
                                <button
                                  onClick={() => handleUndoAction(appointment)}
                                  className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                  title="Undo"
                                >
                                  <Undo2 size={16} />
                                </button>
                              )}
                              
                              {/* Cancel & Reschedule (for upcoming appointments) */}
                              {appointment.status === "upcoming" && (
                                <>
                                  <button
                                    onClick={() => handleRescheduleAppointment(appointment)}
                                    className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                    title="Reschedule"
                                  >
                                    <RefreshCw size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleCancelAppointment(appointment)}
                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Cancel"
                                  >
                                    <PhoneOff size={16} />
                                  </button>
                                </>
                              )}
                              
                              {/* Delete (always available) */}
                              <button
                                onClick={() => handleDeleteAppointment(appointment)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Recommendations Section */}
          <Card className="animate-fade-in delay-200 border-l-4 border-l-[hsl(174,62%,47%)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-[hsl(174,62%,47%)]/10 rounded-lg">
                  <Brain size={20} className="text-[hsl(174,62%,47%)]" />
                </div>
                AI Health Insights
                <span className="ml-auto inline-flex items-center gap-1 px-2 py-1 bg-[hsl(174,62%,47%)]/10 text-[hsl(174,62%,47%)] text-xs font-medium rounded-full">
                  <Sparkles size={12} />
                  Powered by Snowflake Cortex
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Loading state */}
                {aiInsights.loading && (
                  <div className="p-4 bg-gradient-to-r from-[hsl(174,62%,95%)] to-white rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-[hsl(174,62%,47%)] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gray-600">Analyzing your health entries...</p>
                    </div>
                  </div>
                )}

                {/* Error state */}
                {aiInsights.error && !aiInsights.loading && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600">{aiInsights.error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={async () => {
                        setAiInsights(prev => ({ ...prev, loading: true, error: null }));
                        try {
                          const response = await dashboardAPI.getAIInsights();
                          if (response.success && response.data) {
                            setAiInsights({
                              insights: response.data.insights || [],
                              recommendations: response.data.recommendations || [],
                              summary: response.data.summary || "",
                              loading: false,
                              error: null,
                            });
                          }
                        } catch {
                          setAiInsights(prev => ({
                            ...prev,
                            loading: false,
                            error: "Unable to load AI insights",
                          }));
                        }
                      }}
                    >
                      <RefreshCw size={14} className="mr-2" />
                      Retry
                    </Button>
                  </div>
                )}

                {/* AI Insights */}
                {!aiInsights.loading && !aiInsights.error && (
                  <div className="p-4 bg-gradient-to-r from-[hsl(174,62%,95%)] to-white rounded-xl">
                    {/* Summary */}
                    {aiInsights.summary && (
                      <div className="mb-4 p-3 bg-white/80 rounded-lg border border-[hsl(174,62%,47%)]/20">
                        <p className="text-sm text-gray-700 italic">{aiInsights.summary}</p>
                      </div>
                    )}

                    <h4 className="font-semibold text-gray-900 mb-3">AI-Generated Insights:</h4>
                    <div className="space-y-3">
                      {/* Show AI insights if available */}
                      {aiInsights.insights.length > 0 ? (
                        aiInsights.insights.map((insight, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className={`w-2 h-2 mt-2 rounded-full ${
                              index === 0 ? "bg-[hsl(174,62%,47%)]" : 
                              index === 1 ? "bg-blue-500" : "bg-purple-500"
                            }`} />
                            <div>
                              <p className="text-sm text-gray-700">{insight}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          {/* Fallback to static insights */}
                          {(stats.entriesBySeverity.find(s => s.severity === "High")?.count ?? 0) > 0 && (
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 mt-2 bg-red-500 rounded-full" />
                              <div>
                                <p className="text-sm text-gray-700">
                                  <strong>Priority Alert:</strong> You have {stats.entriesBySeverity.find(s => s.severity === "High")?.count ?? 0} high-severity entries this period. 
                                  Consider scheduling a check-up with your healthcare provider.
                                </p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 mt-2 bg-[hsl(174,62%,47%)] rounded-full" />
                            <div>
                              <p className="text-sm text-gray-700">
                                <strong>Pattern Detected:</strong> Your most common symptoms include {uniqueSymptoms[0] || "various conditions"}. 
                                Keeping a consistent log helps identify triggers and trends over time.
                              </p>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Recommendations */}
                      {aiInsights.recommendations.length > 0 && (
                        <>
                          <h4 className="font-semibold text-gray-900 mt-4 mb-2">Recommendations:</h4>
                          {aiInsights.recommendations.map((rec, index) => (
                            <div key={`rec-${index}`} className="flex items-start gap-3">
                              <div className="w-2 h-2 mt-2 bg-green-500 rounded-full" />
                              <div>
                                <p className="text-sm text-gray-700">{rec}</p>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Quick action suggestion */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Activity size={20} className="text-[hsl(174,62%,47%)]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Ready to share with your doctor?</p>
                      <p className="text-sm text-gray-500">Generate a summary report of your recent entries</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={generateHealthReport}>
                    <FileDown size={16} className="mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="space-y-6">
            {/* Chart Filters */}
            <Card className="animate-fade-in delay-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter size={20} className="text-[hsl(174,62%,47%)]" />
                  Chart Filters
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChartFilters(!showChartFilters)}
                >
                  {showChartFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
              </CardHeader>

              {showChartFilters && (
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Date Range</label>
                      <Select
                        value={chartDateRange}
                        onChange={(e) => setChartDateRange(e.target.value as DateRange)}
                        options={[
                          { value: "1week", label: "Last 1 Week" },
                          { value: "1month", label: "Last 1 Month" },
                          { value: "3months", label: "Last 3 Months" },
                          { value: "1year", label: "Last 1 Year" },
                          { value: "all", label: "All Time" },
                          { value: "custom", label: "Custom Range" },
                        ]}
                        className="w-40"
                      />
                    </div>

                    {chartDateRange === "custom" && (
                      <>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">Start Date</label>
                          <Input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-40"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 mb-1">End Date</label>
                          <Input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-40"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Severity</label>
                      <Select
                        value={chartSeverityFilter}
                        onChange={(e) => setChartSeverityFilter(e.target.value as SeverityFilter)}
                        options={[
                          { value: "all", label: "All Severities" },
                          { value: "high", label: "High Only" },
                          { value: "medium", label: "Medium Only" },
                          { value: "low", label: "Low Only" },
                        ]}
                        className="w-40"
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Line Chart */}
              <Card className="animate-fade-in delay-300">
                <CardHeader>
                  <CardTitle className="text-lg">Entries Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={filteredChartData.lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }} 
                          stroke="#9ca3af"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }} 
                          stroke="#9ca3af"
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Legend />
                        {chartSeverityFilter === "all" ? (
                          <>
                            <Line
                              type="monotone"
                              dataKey="high"
                              name="High"
                              stroke="#ef4444"
                              strokeWidth={2}
                              dot={{ fill: "#ef4444", strokeWidth: 2 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="medium"
                              name="Medium"
                              stroke="#eab308"
                              strokeWidth={2}
                              dot={{ fill: "#eab308", strokeWidth: 2 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="low"
                              name="Low"
                              stroke="#22c55e"
                              strokeWidth={2}
                              dot={{ fill: "#22c55e", strokeWidth: 2 }}
                            />
                          </>
                        ) : (
                          <Line
                            type="monotone"
                            dataKey="total"
                            name="Entries"
                            stroke={getSeverityColor(chartSeverityFilter as "high" | "medium" | "low")}
                            strokeWidth={2}
                            dot={{ fill: getSeverityColor(chartSeverityFilter as "high" | "medium" | "low"), strokeWidth: 2 }}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card className="animate-fade-in delay-400">
                <CardHeader>
                  <CardTitle className="text-lg">Symptoms Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {filteredChartData.pieData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        No data for selected filters
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={filteredChartData.pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name || 'Unknown'} ${((percent ?? 0) * 100).toFixed(0)}%`
                            }
                          >
                            {filteredChartData.pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                            formatter={(value) => [`${value} entries`]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Severity Distribution */}
            <Card className="animate-fade-in delay-500">
              <CardHeader>
                <CardTitle className="text-lg">Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {stats.entriesBySeverity.map((item) => (
                    <div
                      key={item.severity}
                      className={`p-6 rounded-xl text-center ${
                        item.severity === "High"
                          ? "bg-red-50 border border-red-200"
                          : item.severity === "Medium"
                          ? "bg-yellow-50 border border-yellow-200"
                          : "bg-green-50 border border-green-200"
                      }`}
                    >
                      <p
                        className={`text-4xl font-bold ${
                          item.severity === "High"
                            ? "text-red-500"
                            : item.severity === "Medium"
                            ? "text-yellow-500"
                            : "text-green-500"
                        }`}
                      >
                        {item.count}
                      </p>
                      <p className="text-gray-600 mt-1">{item.severity} Severity</p>
                      <p className="text-sm text-gray-400">
                        {((item.count / stats.totalEntries) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-xl">Edit Profile</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowEditProfile(false)}
              >
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(174,62%,47%)] to-[hsl(174,62%,37%)] flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(174,62%,47%)] text-white rounded-lg hover:bg-[hsl(174,62%,37%)] transition-colors">
                        <Upload size={16} />
                        Upload Photo
                      </span>
                    </label>
                    {profileImage && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setProfileImage(null)}
                      >
                        Remove Photo
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Family Health History */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Heart size={16} className="inline mr-2 text-pink-500" />
                  Family Health History
                </label>
                <p className="text-sm text-gray-500 mb-3">Select all conditions that apply to your family medical history</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {familyHistoryOptions.map((option) => (
                    <label 
                      key={option}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        editFamilyHistory.includes(option)
                          ? "bg-pink-50 border-pink-300 text-pink-700"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={editFamilyHistory.includes(option)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (option === "None") {
                              setEditFamilyHistory(["None"]);
                            } else {
                              setEditFamilyHistory(prev => [...prev.filter(h => h !== "None"), option]);
                            }
                          } else {
                            setEditFamilyHistory(prev => prev.filter(h => h !== option));
                          }
                        }}
                        className="w-4 h-4 text-pink-500 rounded"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowEditProfile(false)}>
                  Cancel
                </Button>
                <Button onClick={async () => {
                  try {
                    await dashboardAPI.updateProfile({
                      familyHistory: editFamilyHistory,
                      profileImage: profileImage || undefined,
                    });
                    setShowEditProfile(false);
                    setShowChangesSaved(true);
                    setTimeout(() => setShowChangesSaved(false), 5000);
                  } catch (error) {
                    console.error("Failed to save profile:", error);
                  }
                }}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Entry Modal */}
      {showAddEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20 overflow-y-auto">
          <Card className="w-full max-w-xl animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <Plus size={20} className="text-green-500" />
                Add New Entry
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAddEntry(false)}
              >
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Symptom Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select or Enter Symptom
                </label>
                
                {/* Search Input */}
                <div className="relative mb-3">
                  <Input
                    type="text"
                    placeholder="Search symptoms..."
                    value={symptomSearch}
                    onChange={(e) => setSymptomSearch(e.target.value)}
                    className="pr-10"
                  />
                  <Activity size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                
                {/* Symptoms List */}
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
                  {filteredSymptoms.map((symptom) => (
                    <button
                      key={symptom.name}
                      type="button"
                      onClick={() => {
                        setSelectedSymptom(symptom.name);
                        setCustomSymptom("");
                        setEntrySeverity(symptom.recommendedSeverity);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-all ${
                        selectedSymptom === symptom.name
                          ? "bg-[hsl(174,62%,47%)] text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <span>{symptom.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedSymptom === symptom.name 
                          ? "bg-white/20 text-white"
                          : symptom.recommendedSeverity === "high" 
                            ? "bg-red-100 text-red-600"
                            : symptom.recommendedSeverity === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-600"
                      }`}>
                        {symptom.recommendedSeverity}
                      </span>
                    </button>
                  ))}
                  
                  {filteredSymptoms.length === 0 && symptomSearch && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No symptoms found. Add it as custom below.
                    </p>
                  )}
                </div>
                
                {/* Custom Symptom */}
                <div className="mt-3">
                  <label className="block text-xs text-gray-500 mb-1">Or enter custom symptom:</label>
                  <Input
                    type="text"
                    placeholder="Enter custom symptom..."
                    value={customSymptom}
                    onChange={(e) => {
                      setCustomSymptom(e.target.value);
                      setSelectedSymptom("");
                      if (e.target.value && !selectedSymptom) {
                        setEntrySeverity("low"); // Default for custom
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* Severity Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Level
                  {selectedSymptom && (
                    <span className="ml-2 text-xs text-gray-500 font-normal">
                      (Recommended: {commonSymptoms.find(s => s.name === selectedSymptom)?.recommendedSeverity})
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEntrySeverity("low")}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      entrySeverity === "low"
                        ? "bg-green-500 text-white shadow-lg scale-105"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    Low
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntrySeverity("medium")}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      entrySeverity === "medium"
                        ? "bg-yellow-500 text-white shadow-lg scale-105"
                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                    }`}
                  >
                    Moderate
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntrySeverity("high")}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      entrySeverity === "high"
                        ? "bg-red-500 text-white shadow-lg scale-105"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    High
                  </button>
                </div>
              </div>
              
              {/* Entry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <Input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-400 mt-1">Defaults to today. You can select a past date if needed.</p>
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <Input
                  type="text"
                  placeholder="Brief description (100 chars max)"
                  value={entryNote}
                  onChange={(e) => setEntryNote(e.target.value.slice(0, 100))}
                  maxLength={100}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{entryNote.length}/100</p>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAddEntry(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-green-500 hover:bg-green-600"
                  disabled={!selectedSymptom && !customSymptom}
                  onClick={async () => {
                    const symptom = selectedSymptom || customSymptom;
                    if (!symptom) return;
                    
                    try {
                      const response = await dashboardAPI.addEntry({
                        date: entryDate,
                        symptoms: symptom,
                        severity: entrySeverity,
                        category: "General",
                        notes: entryNote || undefined,
                      });
                      
                      if (response.success && response.data) {
                        // Update dashboard data with new entry - including live severity distribution update
                        setDashboardData(prev => {
                          if (!prev) return prev;
                          
                          // Update severity counts
                          const updatedEntriesBySeverity = prev.stats.entriesBySeverity.map(item => {
                            if (item.severity.toLowerCase() === entrySeverity) {
                              return { ...item, count: item.count + 1 };
                            }
                            return item;
                          });
                          
                          return {
                            ...prev,
                            recentEntries: [response.data, ...prev.recentEntries],
                            stats: {
                              ...prev.stats,
                              totalEntries: prev.stats.totalEntries + 1,
                              entriesBySeverity: updatedEntriesBySeverity,
                            },
                          };
                        });
                        
                        setShowAddEntry(false);
                        setSelectedSymptom("");
                        setCustomSymptom("");
                        setSymptomSearch("");
                        setEntrySeverity("low");
                        setEntryNote("");
                        setEntryDate(new Date().toISOString().split('T')[0]);
                        setShowEntryConfirmation(true);
                        setTimeout(() => setShowEntryConfirmation(false), 5000);

                        // Refresh AI insights after adding entry
                        setTimeout(async () => {
                          try {
                            const insightsResponse = await dashboardAPI.getAIInsights();
                            if (insightsResponse.success && insightsResponse.data) {
                              setAiInsights({
                                insights: insightsResponse.data.insights || [],
                                recommendations: insightsResponse.data.recommendations || [],
                                summary: insightsResponse.data.summary || "",
                                loading: false,
                                error: null,
                              });
                            }
                          } catch (error) {
                            console.error("Failed to refresh AI insights:", error);
                          }
                        }, 500);
                      }
                    } catch (error) {
                      console.error("Failed to add entry:", error);
                    }
                  }}
                >
                  <Plus size={16} className="mr-2" />
                  Add Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAddAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar size={20} className="text-blue-500" />
                Add Appointment
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAddAppointment(false)}
              >
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Title *
                </label>
                <Input
                  type="text"
                  value={newAppointment.title}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Annual Physical, Follow-up"
                />
              </div>
              
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Provider *
                </label>
                <Select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  options={[
                    { value: "", label: "-- Select a provider --" },
                    { value: "none", label: "No Provider" },
                    ...providers.map(p => ({
                      value: p.id,
                      label: `${p.name} - ${p.specialty || 'General'}`
                    }))
                  ]}
                  className="w-full"
                />
                {selectedProviderId && selectedProviderId !== "none" && providers.find(p => p.id === selectedProviderId) && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="font-medium">{providers.find(p => p.id === selectedProviderId)?.name}</p>
                    <p className="text-gray-500">{providers.find(p => p.id === selectedProviderId)?.phoneNumber}</p>
                    <p className="text-gray-500">{providers.find(p => p.id === selectedProviderId)?.location}</p>
                  </div>
                )}
                {selectedProviderId === "none" && (
                  <div className="mt-2 p-3 bg-yellow-50 rounded-lg text-sm">
                    <p className="text-yellow-700">No provider will be assigned to this appointment.</p>
                  </div>
                )}
              </div>
              
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-gray-400 font-normal">(override provider location)</span>
                </label>
                <Input
                  type="text"
                  value={newAppointment.location}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Leave blank to use provider's location"
                />
              </div>
              
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <Input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <Input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
              
              {/* Reminder Toggle */}
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-blue-600" />
                    <span className="font-medium text-gray-800">Send Reminder</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewAppointment(prev => ({ ...prev, reminderEnabled: !prev.reminderEnabled }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      newAppointment.reminderEnabled ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      newAppointment.reminderEnabled ? "left-7" : "left-1"
                    }`} />
                  </button>
                </div>
                {newAppointment.reminderEnabled && (
                  <p className="text-xs text-blue-600 mt-2">
                    You&apos;ll receive a text reminder 24 hours before this appointment.
                  </p>
                )}
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAddAppointment(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600"
                  disabled={!newAppointment.title || !newAppointment.date || !newAppointment.time || (!selectedProviderId || selectedProviderId === "")}
                  onClick={handleAddAppointment}
                >
                  <Plus size={16} className="mr-2" />
                  Add Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <PhoneOff size={20} className="text-red-500" />
                Cancel Appointment
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setShowCancelModal(false); setSelectedAppointment(null); }}
              >
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Appointment Info */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-800">{selectedAppointment.title}</p>
                <p className="text-sm text-gray-600">{selectedAppointment.providerName}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {formatAppointmentDate(selectedAppointment.date)} at {formatTime(selectedAppointment.time)}
                </p>
              </div>
              
              {/* Teli AI Info */}
              <div className="p-4 bg-[hsl(174,62%,95%)] rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[hsl(174,62%,47%)] rounded-full flex items-center justify-center">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[hsl(174,62%,30%)]">Teli AI will call to cancel</p>
                    <p className="text-sm text-[hsl(174,62%,40%)] mt-1">
                      Our AI assistant will call {selectedAppointment.providerPhone} to cancel this appointment on your behalf.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Preferred Call Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred call time
                </label>
                <Select
                  value={actionForm.preferredCallHour.toString()}
                  onChange={(e) => setActionForm(prev => ({ ...prev, preferredCallHour: parseInt(e.target.value) }))}
                  options={Array.from({ length: 12 }, (_, i) => i + 8).map(hour => ({
                    value: hour.toString(),
                    label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`,
                  }))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Teli AI will attempt to call during business hours</p>
              </div>
              
              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => { setShowCancelModal(false); setSelectedAppointment(null); }}>
                  Keep Appointment
                </Button>
                <Button 
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={submitCancellation}
                >
                  Request Cancellation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <RefreshCw size={20} className="text-purple-500" />
                Reschedule Appointment
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setShowRescheduleModal(false); setSelectedAppointment(null); }}
              >
                <X size={20} />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Current Appointment */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase mb-1">Current Appointment</p>
                <p className="font-medium text-gray-800">{selectedAppointment.title}</p>
                <p className="text-sm text-gray-600">{selectedAppointment.providerName}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatAppointmentDate(selectedAppointment.date)} at {formatTime(selectedAppointment.time)}
                </p>
              </div>
              
              {/* New Date/Time */}
              <div className="p-4 bg-purple-50 rounded-xl">
                <p className="text-xs text-purple-600 uppercase mb-3 font-medium">Preferred New Time</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Date</label>
                    <Input
                      type="date"
                      value={actionForm.newDate}
                      onChange={(e) => setActionForm(prev => ({ ...prev, newDate: e.target.value }))}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Time</label>
                    <Input
                      type="time"
                      value={actionForm.newTime}
                      onChange={(e) => setActionForm(prev => ({ ...prev, newTime: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              {/* Teli AI Info */}
              <div className="p-4 bg-[hsl(174,62%,95%)] rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[hsl(174,62%,47%)] rounded-full flex items-center justify-center">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[hsl(174,62%,30%)]">Teli AI will call to reschedule</p>
                    <p className="text-sm text-[hsl(174,62%,40%)] mt-1">
                      Our AI will request your preferred time, but the final time depends on availability.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Preferred Call Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred call time
                </label>
                <Select
                  value={actionForm.preferredCallHour.toString()}
                  onChange={(e) => setActionForm(prev => ({ ...prev, preferredCallHour: parseInt(e.target.value) }))}
                  options={Array.from({ length: 12 }, (_, i) => i + 8).map(hour => ({
                    value: hour.toString(),
                    label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`,
                  }))}
                  className="w-full"
                />
              </div>
              
              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => { setShowRescheduleModal(false); setSelectedAppointment(null); }}>
                  Cancel
                </Button>
                <Button 
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                  disabled={!actionForm.newDate || !actionForm.newTime}
                  onClick={submitReschedule}
                >
                  Request Reschedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Entry Confirmation Toast */}
      {showEntryConfirmation && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in-from-right">
          <Card className="bg-green-50 border-green-200 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-800">Entry Added!</p>
                <p className="text-sm text-green-600">Your health entry has been recorded.</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 text-green-600 hover:text-green-800"
                onClick={() => setShowEntryConfirmation(false)}
              >
                <X size={16} />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Changes Saved Toast */}
      {showChangesSaved && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in-from-right">
          <Card className="bg-blue-50 border-blue-200 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-blue-800">Changes Saved!</p>
                <p className="text-sm text-blue-600">Your profile has been updated.</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 text-blue-600 hover:text-blue-800"
                onClick={() => setShowChangesSaved(false)}
              >
                <X size={16} />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Generated Toast */}
      {showReportGenerated && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in-from-right">
          <Card className="bg-purple-50 border-purple-200 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <CheckCircle size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-purple-800">Report Generated!</p>
                <p className="text-sm text-purple-600">Your health report is ready to download.</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 text-purple-600 hover:text-purple-800"
                onClick={() => setShowReportGenerated(false)}
              >
                <X size={16} />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Logged Out Toast */}
      {showLoggedOut && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-in-from-top">
          <Card className="bg-gray-50 border-gray-200 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                <LogOut size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Logged Out Successfully</p>
                <p className="text-sm text-gray-600">Redirecting to home page...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Appointment Added Toast */}
      {showAppointmentAdded && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-in-from-right">
          <Card className="bg-blue-50 border-blue-200 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-blue-800">Appointment Added!</p>
                <p className="text-sm text-blue-600">Your appointment has been scheduled.</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 text-blue-600 hover:text-blue-800"
                onClick={() => setShowAppointmentAdded(false)}
              >
                <X size={16} />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
