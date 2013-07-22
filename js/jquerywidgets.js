// Generated by CoffeeScript 1.5.0

/*
jQuery widgets that uses ``devilry_file_upload``.


Requirements
============
- jQuery (http://jquery.com/)


Style guide
===========
- All classes use ``devilry_file_upload.applyOptions`` for their options.
- Classes raise events using ``devilry_file_upload.Observable``.
- We use the ``Jq`` suffix to distinguish jQuery elements from normal html
  elements.
*/


(function() {
  var FileUploadProgressWidget, FileUploadWidget, UploadedFilePreviewWidget, UploadedFileWidget,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (window.devilry_file_upload == null) {
    throw "devilry_file_upload.js must be imported before bootstrap_widgets.js";
  }

  UploadedFileWidget = (function(_super) {

    __extends(UploadedFileWidget, _super);

    function UploadedFileWidget(options) {
      this._onDeleteError = __bind(this._onDeleteError, this);
      this._onDeleteSuccess = __bind(this._onDeleteSuccess, this);
      this._onDelete = __bind(this._onDelete, this);
      var renderFunction, renderedHtml;
      UploadedFileWidget.__super__.constructor.call(this, options);
      options = devilry_file_upload.applyOptions('UploadedFileWidget', options, {
        deleteRequestArgs: null,
        deleteButtonSelector: '.deleteButton',
        deletingMessageSelector: '.deletingMessage'
      }, ['filename', 'renderFunction']);
      this.filename = options.filename, renderFunction = options.renderFunction, this.deleteRequestArgs = options.deleteRequestArgs, this.deleteButtonSelector = options.deleteButtonSelector, this.deletingMessageSelector = options.deletingMessageSelector;
      renderedHtml = renderFunction.apply(this);
      this.elementJq = jQuery(renderedHtml);
      if ((this.deleteRequestArgs != null) && (this.deleteButtonSelector != null)) {
        this.deleteButton = this.elementJq.find(this.deleteButtonSelector);
        if (this.deleteButton.length === 0) {
          throw "Could not find '" + this.deleteButtonSelector + "' in the rendered view: " + renderedHtml;
        }
        if (this.deletingMessageSelector != null) {
          this.deletingMessage = this.elementJq.find(this.deletingMessageSelector);
          this.deletingMessage.hide();
        }
        this.deleteButton.on('click', this._onDelete);
      }
    }

    UploadedFileWidget.prototype.showDeletingMessage = function() {
      if (this.deletingMessage != null) {
        this.deleteButton.hide();
        return this.deletingMessage.show();
      }
    };

    UploadedFileWidget.prototype.hideDeletingMessage = function() {
      if (this.deletingMessage != null) {
        this.deletingMessage.hide();
        return this.deleteButton.show();
      }
    };

    UploadedFileWidget.prototype._onDelete = function(e) {
      var abort;
      e.preventDefault();
      abort = this.fireEvent('delete', this);
      if (abort) {

      } else {
        return this.deleteFile();
      }
    };

    UploadedFileWidget.prototype.deleteFile = function() {
      var options,
        _this = this;
      this.showDeletingMessage();
      options = jQuery.extend({}, this.deleteRequestArgs, {
        success: this._onDeleteSuccess,
        error: this._onDeleteError,
        complete: function() {
          return _this.hideDeletingMessage();
        }
      });
      return jQuery.ajax(options);
    };

    UploadedFileWidget.prototype._onDeleteSuccess = function(data, status) {
      this.fireEvent('deleteSuccess', this, data, status);
      return this.elementJq.remove();
    };

    UploadedFileWidget.prototype._onDeleteError = function(jqXHR, textStatus, errorThrown) {
      return this.fireEvent('deleteError', this, jqXHR, textStatus, errorThrown);
    };

    return UploadedFileWidget;

  })(devilry_file_upload.Observable);

  UploadedFilePreviewWidget = (function(_super) {

    __extends(UploadedFilePreviewWidget, _super);

    function UploadedFilePreviewWidget(options) {
      this.onLoadPreviewText = __bind(this.onLoadPreviewText, this);
      this.onLoadPreviewImage = __bind(this.onLoadPreviewImage, this);
      var fileWrapper, hasPreviewCls, previewFile, previewSelector, previewText, previewUrl, reader;
      UploadedFilePreviewWidget.__super__.constructor.call(this, options);
      options = devilry_file_upload.applyOptions('UploadedFilePreviewWidget', options, {
        hasPreviewCls: 'hasPreview',
        previewSelector: '.preview',
        previewFile: null,
        previewUrl: null,
        previewText: null
      }, []);
      previewFile = options.previewFile, previewUrl = options.previewUrl, previewText = options.previewText, previewSelector = options.previewSelector, hasPreviewCls = options.hasPreviewCls;
      this.previewJq = this.elementJq.find(previewSelector);
      if (previewUrl != null) {
        this.setPreviewImage(previewUrl);
      } else if (previewFile != null) {
        fileWrapper = new devilry_file_upload.FileWrapper(previewFile);
        if (fileWrapper.isImage() || fileWrapper.isText()) {
          this.elementJq.addClass(hasPreviewCls);
          reader = new FileReader();
          if (fileWrapper.isImage()) {
            reader.onload = this.onLoadPreviewImage;
            reader.readAsDataURL(fileWrapper.file);
          } else {
            reader.onload = this.onLoadPreviewText;
            reader.readAsText(fileWrapper.file);
          }
        }
      }
    }

    UploadedFilePreviewWidget.prototype.setPreviewImage = function(url) {
      return this.previewJq.css({
        'background-image': "url(" + url + ")"
      });
    };

    UploadedFilePreviewWidget.prototype.setPreviewText = function(text) {
      return this.previewJq.text(text);
    };

    UploadedFilePreviewWidget.prototype.onLoadPreviewImage = function(event) {
      return this.setPreviewImage(event.target.result);
    };

    UploadedFilePreviewWidget.prototype.onLoadPreviewText = function(event) {
      var text;
      text = event.target.result;
      return this.setPreviewText(text);
    };

    return UploadedFilePreviewWidget;

  })(UploadedFileWidget);

  FileUploadWidget = (function() {

    function FileUploadWidget(options) {
      this._onClickFileUploadButton = __bind(this._onClickFileUploadButton, this);
      this._onDropFiles = __bind(this._onDropFiles, this);
      this._onDragLeave = __bind(this._onDragLeave, this);
      this._onDragEnter = __bind(this._onDragEnter, this);
      this._onCreateWidget = __bind(this._onCreateWidget, this);      options = devilry_file_upload.applyOptions('FileUploadWidget', options, {
        draggingClass: 'dragover',
        supportsDragAndDropFileUploadClass: 'supportsDragAndDropFileUpload',
        fileUploadButtonSelector: '.fileUploadButton'
      }, ['fileUpload']);
      this.fileUpload = options.fileUpload, this.draggingClass = options.draggingClass, this.supportsDragAndDropFileUploadClass = options.supportsDragAndDropFileUploadClass, this.fileUploadButtonSelector = options.fileUploadButtonSelector;
      this.containerJq = jQuery(this.fileUpload.getContainerElement());
      if (devilry_file_upload.browserInfo.supportsDragAndDropFileUpload()) {
        this.fileUpload.on('dragenter', this._onDragEnter);
        this.fileUpload.on('dragleave', this._onDragLeave);
        this.fileUpload.on('dropFiles', this._onDropFiles);
        this.containerJq.addClass(this.supportsDragAndDropFileUploadClass);
        this._attachFileUploadListener();
      }
      this.fileUpload.on('createWidget', this._onCreateWidget);
    }

    FileUploadWidget.prototype.destroy = function() {
      if (devilry_file_upload.browserInfo.supportsDragAndDropFileUpload()) {
        this.fileUpload.off('dragenter', this._onDragEnter);
        this.fileUpload.off('dragleave', this._onDragLeave);
        return this.fileUpload.off('dropFiles', this._onDropFiles);
      }
    };

    FileUploadWidget.prototype._attachFileUploadListener = function() {
      return jQuery(this.fileUpload.getCurrentWidgetElement()).find(this.fileUploadButtonSelector).on('click', this._onClickFileUploadButton);
    };

    FileUploadWidget.prototype._onCreateWidget = function() {
      if (devilry_file_upload.browserInfo.supportsDragAndDropFileUpload()) {
        return this._attachFileUploadListener();
      }
    };

    FileUploadWidget.prototype._onDragEnter = function() {
      return this.containerJq.addClass(this.draggingClass);
    };

    FileUploadWidget.prototype._onDragLeave = function() {
      return this.containerJq.removeClass(this.draggingClass);
    };

    FileUploadWidget.prototype._onDropFiles = function() {
      return this.containerJq.removeClass(this.draggingClass);
    };

    FileUploadWidget.prototype._onClickFileUploadButton = function(e) {
      e.preventDefault();
      return jQuery(this.fileUpload.getCurrentFileFieldElement()).click();
    };

    return FileUploadWidget;

  })();

  FileUploadProgressWidget = (function() {

    function FileUploadProgressWidget(options) {
      this._onFinished = __bind(this._onFinished, this);
      this._onProgress = __bind(this._onProgress, this);
      this._onAbort = __bind(this._onAbort, this);
      var abortButtonSelector, progressBarSelector, progressSelector, renderFunction, renderedHtml;
      options = devilry_file_upload.applyOptions('FileUploadProgressWidget', options, {
        progressSelector: '.inlineProgress',
        progressBarSelector: '.bar',
        abortButtonSelector: '.abortButton'
      }, ['asyncFileUploader', 'renderFunction']);
      this.asyncFileUploader = options.asyncFileUploader, renderFunction = options.renderFunction, progressBarSelector = options.progressBarSelector, progressSelector = options.progressSelector, abortButtonSelector = options.abortButtonSelector;
      renderedHtml = renderFunction.apply(this);
      this.elementJq = jQuery(renderedHtml);
      this.progressJq = this.elementJq.find(progressSelector);
      this.progressBarJq = this.progressJq.find(progressBarSelector);
      this.progressJq.hide();
      this.asyncFileUploader.on('progress', this._onProgress);
      this.asyncFileUploader.on('finished', this._onFinished);
      if (devilry_file_upload.browserInfo.supportsXhrFileUpload()) {
        if (abortButtonSelector != null) {
          this.abortButtonJq = this.elementJq.find(abortButtonSelector);
        }
        this.abortButtonJq.on('click', this._onAbort);
        this.abortButtonJq.show();
      }
    }

    FileUploadProgressWidget.prototype._destroy = function() {
      this.asyncFileUploader.off('progress', this._onProgress);
      return this.elementJq.remove();
    };

    FileUploadProgressWidget.prototype._onAbort = function() {
      this.asyncFileUploader.abort();
      this.asyncFileUploader.off('finished', this._onFinished);
      return this._destroy();
    };

    FileUploadProgressWidget.prototype._onProgress = function(asyncFileUploader, state) {
      this.progressJq.show();
      return this.progressBarJq.width("" + state + "%");
    };

    FileUploadProgressWidget.prototype._onFinished = function(asyncFileUploader, state) {
      this._destroy();
      return new devilry_file_upload.ObservableResult({
        remove: true
      });
    };

    return FileUploadProgressWidget;

  })();

  window.devilry_file_upload.jquery = {
    FileUploadWidget: FileUploadWidget,
    FileUploadProgressWidget: FileUploadProgressWidget,
    UploadedFileWidget: UploadedFileWidget,
    UploadedFilePreviewWidget: UploadedFilePreviewWidget
  };

}).call(this);
