(function ($, document, machine) {

    class CandidateList extends React.Component {

        render() {

            var onDelete = this.props.onDelete;
            var createItem = function (itemText) {
                return <li key={Math.random()} id={itemText}>{itemText}
                    <span className="delete" title="Delete" onClick={onDelete.bind(this,
                        itemText)}>
                                                              <i className="fa fa-minus-circle"></i>
                                                          </span>
                </li>
            };
            return <ul className="item-list">{this.props.items.map(createItem)}</ul>;
        }
    }

    const ImportButton = () => {

        function processData(allText) {
            var allTextLines = allText.split(/\r\n|\n/);
            var headers = allTextLines[0].split(',');
            var lines = [];

            for (var i = 1; i < allTextLines.length; i++) {
                var data = allTextLines[i].split(',');
                if (data.length === headers.length) {

                    var tarr = [];
                    for (var j = 0; j < headers.length; j++) {
                        tarr.push(data[j]);
                    }
                    lines.push(tarr);
                }
            }
            return {headers, lines};
        }

        const onFileChange = (e) => {

            const files = e.target.files;

            console.log(files);

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = function (e) {
                const content = e.target.result;
                const data = processData(content);
                data.lines.forEach((line) => {
                    machine.addCandidate(line.join('\t'));
                });
            };

            reader.readAsText(files[0]);
        };

        return (
            <label className={"btn positive-btn"} htmlFor={"file-input"}>
                Import from CSV {" "}<i className="fa fa-plus"></i>
                <input type={"file"} style={{display: 'none'}} id={"file-input"} onChange={onFileChange}/>
            </label>
        )
    };

    class InputForm extends React.Component {

        constructor(props) {
            super(props);
            this.handleAdd = this.handleAdd.bind(this);
            // this.handleChange = this.handleChange.bind(this);
            this.handleChangeNumberOfDraws = this.handleChangeNumberOfDraws.bind(this);
            this.state = {
                items: [],
                input: "",
                isWithoutReplacement: false,
                nDraws: 1
            }
        }

        componentDidMount() {
            var reactCpn = this;
            fetch("/configs")
                .then((res) => res.json())
                .then((result) => {
                    this.setState({
                        items: result.candidates,
                        isWithoutReplacement: result.isWithoutReplacement,
                        nDraws: result.numberOfDraws
                    }, () => {
                        if (result.candidates.length > 0) {
                            window.showEditListView();
                        }
                    })
                });
            machine.registerCandidatesUpdateHandler(function (candidates) {
                reactCpn.setState({
                    items: candidates
                });
            });
            machine.registerUpdateIsWithoutReplacementHandler(function (isWithoutReplacement) {
                reactCpn.setState({isWithoutReplacement: isWithoutReplacement});
            });
            machine.registerUpdateNumberOfDrawHandler(function (numberOfDraws) {
                reactCpn.setState({
                    nDraws: numberOfDraws
                });
            });
        }

        handleChange(name) {
            return (e) => {
                this.setState({
                    [name]: e.target.value
                })
            }
        }

        handleChangeNumberOfDraws(e) {
            const v = e.target.value;
            this.setState({
                nDraws: v
            }, () => {
                if (!isNaN(v)) {

                    machine.setNumberOfDraws(v)
                }
            })
        }

        handleAdd(e) {
            e.preventDefault();
            machine.addCandidate(this.state.input);
            this.setState({
                input: ""
            })
        }

        handleDelete(val) {

            machine.removeCandidate(val);
        }

        handleDeleteAll() {

            machine.clearCandidates();
        }

        handleInputDone(e) {
            $('.main-container').removeClass('show animated fadeOutUp');
            $('.main-container').addClass('hide');
            $('#start-view-container').addClass('show animated fadeInDown');
        }

        setWithoutReplacement() {
            machine.setWithoutReplacement($('#rand-without-replacement').is(':checked'));
        }

        render() {

            return (
                <div>
                    <h1>Edit Items</h1>
                    <form id="edit-item-form" onSubmit={this.handleAdd}>
                        <input value={this.state.input} type="text" placeholder="Enter item name" id="new-candidate"
                               onChange={this.handleChange('input')}/>
                        <div className={"btn-set inline-block"}>
                            <button className="btn positive-btn" title="Add" onClick={this.handleAdd}>
                                <i className="fa fa-plus"></i>
                            </button>
                            <ImportButton/>
                        </div>
                        <div className="item-list-container">
                            <h2>Items List</h2>
                            <CandidateList items={this.state.items} onDelete={this.handleDelete}/>
                            <div className="text-right float-right">
                                <a className="delete-all" onClick={this.handleDeleteAll}>
                                    <i className="fa fa-times"></i>
                                    Delete All
                                </a>
                            </div>
                            <div style={{marginBottom: 5}}>
                                <label className={"block"}>Number Of Draws per batch</label>
                                <input value={this.state.nDraws} type="number" placeholder="Number Of Draws" id="number-of-draws"
                                       onChange={this.handleChangeNumberOfDraws} min={1} max={Math.max(this.state.items.length, 1)}/>
                            </div>
                            <label htmlFor="rand-without-replacement" className="text-left">
                                <input checked={!!this.state.isWithoutReplacement} onChange={this.setWithoutReplacement} type="checkbox"
                                       id="rand-without-replacement" name="without-replacement"/>
                                Draw without replacement
                            </label>
                        </div>
                        <div className="btn-set">
                            <button className="btn primary-btn btn-done" onClick={this.handleInputDone}>Done</button>
                        </div>
                    </form>
                </div>
            );
        }
    }

    ReactDOM.render(
        <InputForm items={[]}/>, document.querySelector('#edit-item-container')
    );
})(jQuery, document, window.machine);
