import { useState, useEffect } from 'react';
import { Building2, Users, Plus, User, Save, Lock, CreditCard, Trash2, Edit2, Eye, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authApi, organizationApi, teamApi, businessCardApi } from '../lib/api';
import QRCodeDisplay from './QRCodeDisplay';

interface Organization {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

interface Team {
  _id: string;
  name: string;
  description?: string;
  organizationId: string;
  members?: TeamMember[];
  createdAt: string;
}

interface TeamMember {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  role: 'member' | 'team_admin';
}

interface BusinessCard {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  mobileNumber?: string;
  position?: string;
  company?: string;
  address?: string;
  website?: string;
  profilePicture?: string;
  isPublic: boolean;
  isActive: boolean;
  viewCount: number;
  teamId?: string;
  organizationId?: string;
}

export default function OrganizationDashboard() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'profile' | 'password'>('hierarchy');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamCards, setTeamCards] = useState<Record<string, BusinessCard[]>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Expansion state
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  // Organization form
  const [showOrgForm, setShowOrgForm] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [orgForm, setOrgForm] = useState({
    name: '',
    description: '',
    logo: '',
    website: '',
    address: '',
    phone: '',
    email: ''
  });

  // Team form
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamOrgId, setTeamOrgId] = useState<string>('');
  const [teamForm, setTeamForm] = useState({ name: '', description: '', organizationId: '' });

  // Card form
  const [showCardForm, setShowCardForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState<BusinessCard | null>(null);
  const [cardForm, setCardForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    mobileNumber: '',
    position: '',
    company: '',
    address: '',
    website: '',
    profilePicture: '',
    isPublic: true,
    teamId: '',
    organizationId: ''
  });

  // Profile form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setProfilePicture(user.profilePicture || '');
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [orgData, teamData] = await Promise.all([
        organizationApi.getAll(),
        teamApi.getAll()
      ]);

      const orgs = orgData.organizations || orgData || [];
      const teamsArr = teamData.teams || teamData || [];

      setOrganizations(orgs);
      setTeams(teamsArr);

      // Auto-expand first org
      if (orgs.length > 0) {
        setExpandedOrgs(new Set([orgs[0]._id]));
      }

      // Fetch cards for each team
      const cardsMap: Record<string, BusinessCard[]> = {};
      for (const team of teamsArr) {
        try {
          const cardData = await businessCardApi.getByTeam(team._id);
          cardsMap[team._id] = cardData.cards || [];
        } catch {
          cardsMap[team._id] = [];
        }
      }
      setTeamCards(cardsMap);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCardsForTeam = async (teamId: string) => {
    try {
      const cardData = await businessCardApi.getByTeam(teamId);
      setTeamCards(prev => ({ ...prev, [teamId]: cardData.cards || [] }));
    } catch {
      setTeamCards(prev => ({ ...prev, [teamId]: [] }));
    }
  };

  const toggleOrgExpansion = (orgId: string) => {
    setExpandedOrgs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orgId)) {
        newSet.delete(orgId);
      } else {
        newSet.add(orgId);
      }
      return newSet;
    });
  };

  const toggleTeamExpansion = (teamId: string) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  // Stats
  const totalCards = Object.values(teamCards).flat().length;

  // Organization handlers
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      if (selectedOrg) {
        await organizationApi.update(selectedOrg._id, orgForm);
        setMessage({ type: 'success', text: 'Organization updated successfully!' });
      } else {
        await organizationApi.create(orgForm);
        setMessage({ type: 'success', text: 'Organization created successfully!' });
      }
      fetchData();
      setShowOrgForm(false);
      setSelectedOrg(null);
      resetOrgForm();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save organization' });
    }
  };

  const handleDeleteOrg = async (orgId: string) => {
    if (!confirm('Are you sure you want to delete this organization? All teams and cards will be affected.')) return;

    try {
      await organizationApi.delete(orgId);
      setMessage({ type: 'success', text: 'Organization deleted successfully!' });
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete organization' });
    }
  };

  const handleEditOrg = (org: Organization) => {
    setSelectedOrg(org);
    setOrgForm({
      name: org.name,
      description: org.description || '',
      logo: org.logo || '',
      website: org.website || '',
      address: org.address || '',
      phone: org.phone || '',
      email: org.email || ''
    });
    setShowOrgForm(true);
  };

  const resetOrgForm = () => {
    setOrgForm({
      name: '',
      description: '',
      logo: '',
      website: '',
      address: '',
      phone: '',
      email: ''
    });
  };

  // Team handlers
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      if (selectedTeam) {
        await teamApi.update(selectedTeam._id, teamForm);
        setMessage({ type: 'success', text: 'Team updated successfully!' });
      } else {
        await teamApi.create(teamForm);
        setMessage({ type: 'success', text: 'Team created successfully!' });
      }
      fetchData();
      setShowTeamForm(false);
      setSelectedTeam(null);
      setTeamOrgId('');
      setTeamForm({ name: '', description: '', organizationId: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save team' });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? All cards in this team will be unlinked.')) return;

    try {
      await teamApi.delete(teamId);
      setMessage({ type: 'success', text: 'Team deleted successfully!' });
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete team' });
    }
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setTeamForm({
      name: team.name,
      description: team.description || '',
      organizationId: team.organizationId || ''
    });
    setShowTeamForm(true);
  };

  const handleAddTeamToOrg = (orgId: string) => {
    setTeamOrgId(orgId);
    setTeamForm({ name: '', description: '', organizationId: orgId });
    setShowTeamForm(true);
  };

  // Business Card handlers
  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      if (selectedCard) {
        await businessCardApi.update(selectedCard._id, cardForm);
        setMessage({ type: 'success', text: 'Business card updated successfully!' });
      } else {
        await businessCardApi.create(cardForm);
        setMessage({ type: 'success', text: 'Business card created successfully!' });
      }
      if (cardForm.teamId) {
        fetchCardsForTeam(cardForm.teamId);
      }
      setShowCardForm(false);
      setSelectedCard(null);
      resetCardForm();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save business card' });
    }
  };

  const handleDeleteCard = async (cardId: string, teamId: string) => {
    if (!confirm('Are you sure you want to delete this business card?')) return;

    try {
      await businessCardApi.delete(cardId);
      setMessage({ type: 'success', text: 'Business card deleted successfully!' });
      fetchCardsForTeam(teamId);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete business card' });
    }
  };

  const handleEditCard = (card: BusinessCard) => {
    setSelectedCard(card);
    setCardForm({
      fullName: card.fullName,
      email: card.email,
      phone: card.phone || '',
      mobileNumber: card.mobileNumber || '',
      position: card.position || '',
      company: card.company || '',
      address: card.address || '',
      website: card.website || '',
      profilePicture: card.profilePicture || '',
      isPublic: card.isPublic,
      teamId: card.teamId || '',
      organizationId: card.organizationId || ''
    });
    setShowCardForm(true);
  };

  const handleAddCardToTeam = (teamId: string, orgId: string) => {
    resetCardForm(teamId, orgId);
    setShowCardForm(true);
  };

  const resetCardForm = (teamId?: string, orgId?: string) => {
    setCardForm({
      fullName: '',
      email: '',
      phone: '',
      mobileNumber: '',
      position: '',
      company: '',
      address: '',
      website: '',
      profilePicture: '',
      isPublic: true,
      teamId: teamId || '',
      organizationId: orgId || ''
    });
  };

  const getPublicUrl = (cardId: string) => {
    return `${window.location.origin}/card/${cardId}`;
  };

  // Profile handlers
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      await authApi.updateProfile({ fullName, profilePicture });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      refreshUser();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      await authApi.changePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    }
  };

  if (!user) return null;

  const isFormOpen = showOrgForm || showTeamForm || showCardForm;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* User Type Info */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Organization Account</h2>
            <p className="text-sm text-slate-600">Manage organizations, teams, and business cards in a hierarchical structure</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{organizations.length}</p>
              <p className="text-sm text-slate-600">Organizations</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{teams.length}</p>
              <p className="text-sm text-slate-600">Teams</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalCards}</p>
              <p className="text-sm text-slate-600">Business Cards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'hierarchy' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 className="w-5 h-5" />
          Organizations
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'profile' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <User className="w-5 h-5" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'password' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Lock className="w-5 h-5" />
          Password
        </button>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`px-4 py-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Hierarchy Tab */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-6">
          {!isFormOpen ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900">Organization Hierarchy</h3>
                <button
                  onClick={() => { resetOrgForm(); setShowOrgForm(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Organization
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                </div>
              ) : organizations.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No organizations yet</h3>
                  <p className="text-slate-600 mb-6">Create your first organization to start building your hierarchy</p>
                  <button
                    onClick={() => { resetOrgForm(); setShowOrgForm(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                  >
                    <Plus className="w-4 h-4" />
                    Create Organization
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {organizations.map((org) => {
                    const isOrgExpanded = expandedOrgs.has(org._id);
                    const orgTeams = teams.filter(t => t.organizationId === org._id);

                    return (
                      <div key={org._id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        {/* Organization Header */}
                        <div
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                          onClick={() => toggleOrgExpansion(org._id)}
                        >
                          <div className="flex items-center gap-3">
                            <button className="p-1 hover:bg-slate-100 rounded">
                              {isOrgExpanded ? (
                                <ChevronDown className="w-5 h-5 text-slate-500" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-slate-500" />
                              )}
                            </button>
                            {org.logo ? (
                              <img src={org.logo} alt={org.name} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-purple-600" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold text-slate-900">{org.name}</h4>
                              <p className="text-sm text-slate-500">
                                {orgTeams.length} team{orgTeams.length !== 1 ? 's' : ''}
                                {org.description && ` • ${org.description}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleAddTeamToOrg(org._id)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              <Plus className="w-3 h-3" />
                              Add Team
                            </button>
                            <button
                              onClick={() => handleEditOrg(org)}
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrg(org._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Organization Teams */}
                        {isOrgExpanded && (
                          <div className="border-t border-slate-200 bg-slate-50 p-4">
                            {orgTeams.length === 0 ? (
                              <div className="text-center py-6">
                                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 mb-4">No teams in this organization</p>
                                <button
                                  onClick={() => handleAddTeamToOrg(org._id)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add First Team
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {orgTeams.map((team) => {
                                  const isTeamExpanded = expandedTeams.has(team._id);
                                  const cards = teamCards[team._id] || [];

                                  return (
                                    <div key={team._id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                      {/* Team Header */}
                                      <div
                                        className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                                        onClick={() => toggleTeamExpansion(team._id)}
                                      >
                                        <div className="flex items-center gap-3">
                                          <button className="p-0.5 hover:bg-slate-100 rounded">
                                            {isTeamExpanded ? (
                                              <ChevronDown className="w-4 h-4 text-slate-500" />
                                            ) : (
                                              <ChevronRight className="w-4 h-4 text-slate-500" />
                                            )}
                                          </button>
                                          <div className="p-1.5 bg-blue-100 rounded">
                                            <Users className="w-4 h-4 text-blue-600" />
                                          </div>
                                          <div>
                                            <h5 className="font-medium text-slate-900">{team.name}</h5>
                                            <p className="text-xs text-slate-500">
                                              {cards.length} card{cards.length !== 1 ? 's' : ''}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                          <button
                                            onClick={() => handleAddCardToTeam(team._id, org._id)}
                                            className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-900 text-white rounded hover:bg-slate-800"
                                          >
                                            <Plus className="w-3 h-3" />
                                            Card
                                          </button>
                                          <button
                                            onClick={() => handleEditTeam(team)}
                                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteTeam(team._id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Team Cards */}
                                      {isTeamExpanded && (
                                        <div className="border-t border-slate-200 bg-slate-50 p-3">
                                          {cards.length === 0 ? (
                                            <div className="text-center py-4">
                                              <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                              <p className="text-sm text-slate-500 mb-3">No cards in this team</p>
                                              <button
                                                onClick={() => handleAddCardToTeam(team._id, org._id)}
                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-slate-900 text-white rounded hover:bg-slate-800"
                                              >
                                                <Plus className="w-3 h-3" />
                                                Add Card
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="grid gap-3">
                                              {cards.map((card) => (
                                                <div key={card._id} className="bg-white rounded border border-slate-200 overflow-hidden">
                                                  <div className="flex flex-col sm:flex-row">
                                                    <div className="flex-1 p-3">
                                                      <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                                                          {card.profilePicture ? (
                                                            <img src={card.profilePicture} alt={card.fullName} className="w-full h-full object-cover" />
                                                          ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                              <User className="w-5 h-5 text-slate-400" />
                                                            </div>
                                                          )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                          <h6 className="font-medium text-slate-900 text-sm truncate">{card.fullName}</h6>
                                                          {card.position && <p className="text-xs text-slate-600">{card.position}</p>}
                                                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                            <span className="flex items-center gap-0.5">
                                                              <Eye className="w-3 h-3" />
                                                              {card.viewCount}
                                                            </span>
                                                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                                                              card.isPublic ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                              {card.isPublic ? 'Public' : 'Private'}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      <div className="flex gap-1 mt-2">
                                                        <button
                                                          onClick={() => handleEditCard(card)}
                                                          className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                                                        >
                                                          <Edit2 className="w-2.5 h-2.5" />
                                                          Edit
                                                        </button>
                                                        <a
                                                          href={getPublicUrl(card._id)}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                                                        >
                                                          <ExternalLink className="w-2.5 h-2.5" />
                                                          View
                                                        </a>
                                                        <button
                                                          onClick={() => handleDeleteCard(card._id, team._id)}
                                                          className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                                                        >
                                                          <Trash2 className="w-2.5 h-2.5" />
                                                        </button>
                                                      </div>
                                                    </div>
                                                    <div className="p-3 bg-slate-50 border-t sm:border-t-0 sm:border-l border-slate-200 flex items-center justify-center">
                                                      <QRCodeDisplay value={getPublicUrl(card._id)} size={80} />
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : showOrgForm ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">
                {selectedOrg ? 'Edit Organization' : 'Create New Organization'}
              </h3>
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name *</label>
                    <input
                      type="text"
                      value={orgForm.name}
                      onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                      required
                      placeholder="e.g., Acme Corporation"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      value={orgForm.description}
                      onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
                      rows={2}
                      placeholder="Brief description"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
                    <input
                      type="url"
                      value={orgForm.logo}
                      onChange={(e) => setOrgForm({ ...orgForm, logo: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={orgForm.website}
                      onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={orgForm.email}
                      onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={orgForm.phone}
                      onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowOrgForm(false); setSelectedOrg(null); }}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                  >
                    {selectedOrg ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          ) : showTeamForm ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">
                {selectedTeam ? 'Edit Team' : 'Create New Team'}
              </h3>
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Organization *</label>
                  <select
                    value={teamForm.organizationId}
                    onChange={(e) => setTeamForm({ ...teamForm, organizationId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((org) => (
                      <option key={org._id} value={org._id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Team Name *</label>
                  <input
                    type="text"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    required
                    placeholder="e.g., Engineering Team"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={teamForm.description}
                    onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowTeamForm(false); setSelectedTeam(null); setTeamOrgId(''); }}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                  >
                    {selectedTeam ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">
                {selectedCard ? 'Edit Business Card' : 'Create Business Card'}
              </h3>
              <form onSubmit={handleCreateCard} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={cardForm.fullName}
                      onChange={(e) => setCardForm({ ...cardForm, fullName: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={cardForm.email}
                      onChange={(e) => setCardForm({ ...cardForm, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={cardForm.phone}
                      onChange={(e) => setCardForm({ ...cardForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
                    <input
                      type="tel"
                      value={cardForm.mobileNumber}
                      onChange={(e) => setCardForm({ ...cardForm, mobileNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                    <input
                      type="text"
                      value={cardForm.position}
                      onChange={(e) => setCardForm({ ...cardForm, position: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                    <input
                      type="text"
                      value={cardForm.company}
                      onChange={(e) => setCardForm({ ...cardForm, company: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={cardForm.address}
                      onChange={(e) => setCardForm({ ...cardForm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={cardForm.website}
                      onChange={(e) => setCardForm({ ...cardForm, website: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Profile Picture URL</label>
                    <input
                      type="url"
                      value={cardForm.profilePicture}
                      onChange={(e) => setCardForm({ ...cardForm, profilePicture: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublicOrg"
                    checked={cardForm.isPublic}
                    onChange={(e) => setCardForm({ ...cardForm, isPublic: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isPublicOrg" className="text-sm text-slate-700">Make this card publicly visible</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowCardForm(false); setSelectedCard(null); }}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                  >
                    {selectedCard ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Update Profile</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Profile Picture URL</label>
              <input
                type="url"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
              />
              <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Change Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
