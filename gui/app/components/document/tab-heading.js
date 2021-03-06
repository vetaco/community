// Copyright 2016 Documize Inc. <legal@documize.com>. All rights reserved.
//
// This software (Documize Community Edition) is licensed under
// GNU AGPL v3 http://www.gnu.org/licenses/agpl-3.0.en.html
//
// You can operate outside the AGPL restrictions by purchasing
// Documize Enterprise Edition and obtaining a commercial license
// by contacting <sales@documize.com>.
//
// https://documize.com

import Ember from 'ember';
import TooltipMixin from '../../mixins/tooltip';

const {
	computed,
	inject: { service }
} = Ember;

export default Ember.Component.extend(TooltipMixin, {
	documentService: service('document'),
	expanded: false,
	deleteChildren: false,
	menuOpen: false,
	blockTitle: "",
	blockExcerpt: "",
	documentList: [], 		//includes the current document
	documentListOthers: [], //excludes the current document
	selectedDocument: null,

	checkId: computed('page', function () {
		let id = this.get('page.id');
		return `delete-check-button-${id}`;
	}),
	menuTarget: computed('page', function () {
		let id = this.get('page.id');
		return `page-menu-${id}`;
	}),
	deleteButtonId: computed('page', function () {
		let id = this.get('page.id');
		return `delete-page-button-${id}`;
	}),
	publishButtonId: computed('page', function () {
		let id = this.get('page.id');
		return `publish-button-${id}`;
	}),
	publishDialogId: computed('page', function () {
		let id = this.get('page.id');
		return `publish-dialog-${id}`;
	}),
	blockTitleId: computed('page', function () {
		let id = this.get('page.id');
		return `block-title-${id}`;
	}),
	blockExcerptId: computed('page', function () {
		let id = this.get('page.id');
		return `block-excerpt-${id}`;
	}),
	copyButtonId: computed('page', function () {
		let id = this.get('page.id');
		return `copy-page-button-${id}`;
	}),
	copyDialogId: computed('page', function () {
		let id = this.get('page.id');
		return `copy-dialog-${id}`;
	}),
	moveButtonId: computed('page', function () {
		let id = this.get('page.id');
		return `move-page-button-${id}`;
	}),
	moveDialogId: computed('page', function () {
		let id = this.get('page.id');
		return `move-dialog-${id}`;
	}),

	didRender() {
		$("#" + this.get('blockTitleId')).removeClass('error');
		$("#" + this.get('blockExcerptId')).removeClass('error');
	},

	actions: {
		toggleExpand() {
			this.set('expanded', !this.get('expanded'));
			this.get('onExpand')();
		},

		onMenuOpen() {
			if ($('#' + this.get('publishDialogId')).is( ":visible" )) {
				return;
			}
			if ($('#' + this.get('copyDialogId')).is( ":visible" )) {
				return;
			}
			if ($('#' + this.get('moveDialogId')).is( ":visible" )) {
				return;
			}

			this.set('menuOpen', !this.get('menuOpen'));
		},

		onEdit() {
			this.attrs.onEdit();
		},

		deletePage() {
			this.attrs.onDeletePage(this.get('deleteChildren'));
		},

		onSavePageAsBlock() {
			let page = this.get('page');
			let titleElem = '#' + this.get('blockTitleId');
			let blockTitle = this.get('blockTitle');
			if (is.empty(blockTitle)) {
				$(titleElem).addClass('error');
				return;
			}

			let excerptElem = '#' + this.get('blockExcerptId');
			let blockExcerpt = this.get('blockExcerpt');
			blockExcerpt = blockExcerpt.replace(/\n/g, "");
			if (is.empty(blockExcerpt)) {
				$(excerptElem).addClass('error');
				return;
			}

			this.get('documentService').getPageMeta(this.get('document.id'), page.get('id')).then((pm) => {
				let block = {
					folderId: this.get('folder.id'),
					contentType: page.get('contentType'),
					pageType: page.get('pageType'),
					title: blockTitle,
					body: page.get('body'),
					excerpt: blockExcerpt,
					rawBody: pm.get('rawBody'),
					config: pm.get('config'),
					externalSource: pm.get('externalSource')
				};

				this.attrs.onSavePageAsBlock(block);

				this.set('menuOpen', false);
				this.set('blockTitle', '');
				this.set('blockExcerpt', '');
				$(titleElem).removeClass('error');
				$(excerptElem).removeClass('error');

				return true;
			});
		},

		// Copy/move actions
		onCopyDialogOpen() {
			// Fetch document targets once.
			if (this.get('documentList').length > 0) {
				return;
			}

			this.get('documentService').getPageMoveCopyTargets().then((d) => {
				let me = this.get('document');
				this.set('documentList', d);
				this.set('documentListOthers', d.filter((item) => item.get('id') !== me.get('id')));
			});
		},

		onTargetChange(d) {
			this.set('selectedDocument', d);
		},

		onCopyPage() {
			// can't proceed if no data
			if (this.get('documentList.length') === 0) {
				return;
			}

			let targetDocumentId = this.get('document.id');
			if (is.not.null(this.get('selectedDocument'))) {
				targetDocumentId = this.get('selectedDocument.id');
			}

			this.attrs.onCopyPage(targetDocumentId);
			return true;
		},

		onMovePage() {
			// can't proceed if no data
			if (this.get('documentListOthers.length') === 0) {
				return;
			}

			if (is.null(this.get('selectedDocument'))) {
				this.set('selectedDocument', this.get('documentListOthers')[0]);
			}

			let targetDocumentId = this.get('selectedDocument.id');

			this.attrs.onMovePage(targetDocumentId);
			return true;
		}
	}
});
