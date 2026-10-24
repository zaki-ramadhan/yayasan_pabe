"use client";

import {
	Table,
	TableContainer,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableEmptyRow,
	TablePaginationFooter,
} from "@/components/ui/table";
import { AdminUserModal } from "./AdminUserModal";
import { AdminUserResetDialog } from "./AdminUserResetDialog";
import { AdminUserConfirmDialog } from "./AdminUserConfirmDialog";
import { AdminUserToolbar } from "./AdminUserToolbar";
import { AdminUserTableRow } from "./AdminUserTableRow";
import { useAdminUserManagement } from "./useAdminUserManagement";

export function AdminUserTable({
	initialData = { items: [], pagination: {} },
}) {
	const {
		currentUser,
		users,
		pagination,
		search,
		setSearch,
		roleFilter,
		statusFilter,
		isLoading,
		isModalOpen,
		setIsModalOpen,
		editingUser,
		isSubmitting,
		resetDialogData,
		setResetDialogData,
		confirmState,
		setConfirmState,
		fetchUsers,
		handleSearchSubmit,
		handleRoleChange,
		handleStatusChange,
		handleOpenCreate,
		handleOpenEdit,
		handleModalSubmit,
		handleResetPassword,
		handleResetSubmit,
		handleOpenToggleStatus,
		handleOpenDelete,
		handleConfirmAction,
	} = useAdminUserManagement({ initialData });

	return (
		<div className="space-y-4">
			{/* Filter and Search Bar */}
			<AdminUserToolbar
				search={
					search
				}
				onSearchChange={
					setSearch
				}
				onSearchSubmit={
					handleSearchSubmit
				}
				roleFilter={
					roleFilter
				}
				onRoleChange={
					handleRoleChange
				}
				statusFilter={
					statusFilter
				}
				onStatusChange={
					handleStatusChange
				}
				isLoading={
					isLoading
				}
				onRefresh={() =>
					fetchUsers(
						{
							isRefresh: true,
						},
					)
				}
				onOpenCreate={
					handleOpenCreate
				}
			/>

			{/* Main Table */}
			<TableContainer>
				<div className="overflow-x-auto">
					<Table>
						<TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
							<TableRow>
								<TableHead className="w-56 font-medium text-slate-600 text-sm py-2.5">
									Identitas
									Pengurus
								</TableHead>
								<TableHead className="w-44 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
									Kontak
								</TableHead>
								<TableHead className="w-40 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
									Peran
									&amp;
									Jabatan
								</TableHead>
								<TableHead className="w-28 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
									Status
								</TableHead>
								<TableHead className="w-36 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
									Terdaftar
								</TableHead>
								<TableHead className="w-32 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
									Aksi
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className="divide-y divide-slate-100">
							{users &&
							users.length >
								0 ? (
								users.map(
									(
										user,
									) => (
										<AdminUserTableRow
											key={
												user.id
											}
											user={
												user
											}
											currentUser={
												currentUser
											}
											onEdit={
												handleOpenEdit
											}
											onResetPassword={
												handleResetPassword
											}
											onToggleStatus={
												handleOpenToggleStatus
											}
											onDelete={
												handleOpenDelete
											}
										/>
									),
								)
							) : (
								<TableEmptyRow
									colSpan={
										6
									}
									message="Belum ada data pengurus yang sesuai dengan kriteria filter."
								/>
							)}
						</TableBody>
					</Table>
				</div>

				{/* Standardized Table Pagination Footer */}
				{users.length >
					0 && (
					<TablePaginationFooter
						currentPage={
							pagination.page
						}
						totalPages={
							pagination.totalPages
						}
						total={
							pagination.total ||
							users.length
						}
						limit={
							10
						}
						onPageChange={(
							newPage,
						) =>
							fetchUsers(
								{
									newPage,
								},
							)
						}
					/>
				)}
			</TableContainer>

			{/* Modal Dialog: Tambah / Edit Pengurus */}
			<AdminUserModal
				isOpen={
					isModalOpen
				}
				onClose={() =>
					setIsModalOpen(
						false,
					)
				}
				onSubmit={
					handleModalSubmit
				}
				userToEdit={
					editingUser
				}
				isSubmitting={
					isSubmitting
				}
			/>

			{/* Dialog: Reset Password */}
			<AdminUserResetDialog
				isOpen={Boolean(
					resetDialogData,
				)}
				onClose={() =>
					setResetDialogData(
						null,
					)
				}
				onSubmit={
					handleResetSubmit
				}
				targetUser={
					resetDialogData
				}
				isSubmitting={
					isSubmitting
				}
			/>

			{/* Dialog: Konfirmasi Tangguhkan / Hapus */}
			<AdminUserConfirmDialog
				isOpen={
					confirmState.isOpen
				}
				type={
					confirmState.type
				}
				targetUser={
					confirmState.targetUser
				}
				onClose={() =>
					setConfirmState(
						{
							isOpen: false,
							type: null,
							targetUser: null,
						},
					)
				}
				onConfirm={
					handleConfirmAction
				}
				isSubmitting={
					isSubmitting
				}
			/>
		</div>
	);
}
